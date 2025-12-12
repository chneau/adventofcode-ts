#include <stdint.h>
#include <stdbool.h>
#include <string.h>
#include <stdlib.h>
#include <stdio.h>

#define MAX_WORDS 100

// Metadata: [count, num_moves, start_index]

bool check_islands(uint64_t* grid, int width, int height, int allowed_wasted, int min_piece_area, int words) {
    if (allowed_wasted >= width * height) return true;
    if (allowed_wasted > 200) return true;
    
    uint64_t visited[MAX_WORDS];
    memcpy(visited, grid, sizeof(uint64_t) * words);
    
    int wasted = 0;
    int stack_x[2500];
    int stack_y[2500];
    
    for (int y = 0; y < height; y++) {
        for (int x = 0; x < width; x++) {
            int bit_idx = y * width + x;
            int w_idx = bit_idx / 64;
            int b_idx = bit_idx % 64;
            
            if ((visited[w_idx] >> b_idx) & 1ULL) continue;
            
            int top = 0;
            stack_x[top] = x;
            stack_y[top] = y;
            top++;
            
            visited[w_idx] |= (1ULL << b_idx);
            
            int size = 0;
            
            while (top > 0) {
                top--;
                int cx = stack_x[top];
                int cy = stack_y[top];
                size++;
                
                int dx[] = {1, -1, 0, 0};
                int dy[] = {0, 0, 1, -1};
                
                for(int d=0; d<4; d++) {
                    int nx = cx + dx[d];
                    int ny = cy + dy[d];
                    
                    if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
                        int n_bit = ny * width + nx;
                        int n_w = n_bit / 64;
                        int n_b = n_bit % 64;
                        
                        if (!((visited[n_w] >> n_b) & 1ULL)) {
                             visited[n_w] |= (1ULL << n_b);
                             stack_x[top] = nx;
                             stack_y[top] = ny;
                             top++;
                        }
                    }
                }
            }
            
            if (size < min_piece_area) {
                wasted += size;
                if (wasted > allowed_wasted) return false;
            }
        }
    }
    return true;
}

// Global buffer management
// We need to pass the current buffer pointer
bool solve_rec(
    int task_idx, 
    int count_left, 
    int start_move_idx, // index in the current_lists[task_idx]
    uint64_t* grid, 
    int num_tasks, 
    int32_t* metadata, 
    uint64_t* moves, 
    int words, 
    int width, 
    int height, 
    int allowed_wasted, 
    int min_piece_area,
    int** current_lists, // [num_tasks] pointers to int arrays
    int* current_counts, // [num_tasks] counts
    int* buffer_ptr,     // Pointer to free space in global buffer
    int* buffer_end      // End of global buffer
) {
    if (task_idx >= num_tasks) return true;
    
    int* valid_moves = current_lists[task_idx];
    int num_valid = current_counts[task_idx];
    int meta_base = task_idx * 3;
    int task_start_idx = metadata[meta_base + 2];
    
    // We iterate through valid moves for current task
    // But we must respect start_move_idx (which is an index into the sorted master list?)
    // No, current_lists contains indices into the master list.
    // And current_lists is sorted (because we filter sequentially).
    // So we just need to iterate valid_moves starting from 'start_move_idx' 
    // Wait, 'start_move_idx' passed to solve_rec is "minimum move index allowed".
    // We need to find where this index is in valid_moves?
    // Or simpler: valid_moves contains actual indices.
    // We just ignore any move where valid_moves[i] < start_move_idx.
    
    for (int i = 0; i < num_valid; i++) {
        int move_idx = valid_moves[i];
        if (move_idx < start_move_idx) continue;
        
        uint64_t* move_ptr = &moves[task_start_idx + move_idx * words];
        
        // No need to check clash with grid, it's already filtered!
        // But we need to update grid for island check
        
        uint64_t new_grid[MAX_WORDS];
        for(int w=0; w<words; w++) new_grid[w] = grid[w] | move_ptr[w];
        
        // Island pruning
        if (!check_islands(new_grid, width, height, allowed_wasted, min_piece_area, words)) continue;
        
        // Forward Checking / Filtering
        // Allocate next level lists
        int* next_lists[100]; // Max num_tasks is small (e.g. 6)
        int next_counts[100];
        int* next_buffer_ptr = buffer_ptr;
        
        bool possible = true;
        
        // Optimization: if we are at the very end, skip filtering
        bool completely_done = (task_idx == num_tasks - 1) && (count_left == 1);
        
        if (!completely_done) {
             for (int t = 0; t < num_tasks; t++) {
                int needed = 0;
                if (t == task_idx) needed = count_left - 1;
                else if (t > task_idx) needed = metadata[t * 3 + 0];

                if (needed == 0) {
                    next_counts[t] = 0;
                    next_lists[t] = NULL; 
                    continue;
                }
                
                // We need to allocate space for this list
                // Worst case: same size as current
                int parent_count = current_counts[t];
                if (next_buffer_ptr + parent_count > buffer_end) {
                    // Buffer overflow - should not happen with sufficient allocation
                    return false; 
                }
                next_lists[t] = next_buffer_ptr;
                
                int* parent_list = current_lists[t];
                int* child_list = next_lists[t];
                int child_count = 0;
                
                int t_start_idx = metadata[t * 3 + 2];
                
                for (int k = 0; k < parent_count; k++) {
                    int cand_idx = parent_list[k];
                    
                    // Optimization: For current task, we only keep moves > move_idx (if we are looking for > 1 items)
                    // This is symmetry breaking.
                    if (t == task_idx && cand_idx <= move_idx) continue;
                    
                    uint64_t* cand_ptr = &moves[t_start_idx + cand_idx * words];
                    
                    bool clash = false;
                    for(int w=0; w<words; w++) {
                        if (move_ptr[w] & cand_ptr[w]) {
                            clash = true;
                            break;
                        }
                    }
                    if (!clash) {
                        child_list[child_count++] = cand_idx;
                    }
                }
                
                next_counts[t] = child_count;
                next_buffer_ptr += child_count;
                
                if (child_count < needed) {
                    possible = false;
                    break;
                }
            }
        }
        
        if (!possible) continue;
        
        if (count_left > 1) {
            // Recurse same task
            if (solve_rec(task_idx, count_left - 1, move_idx + 1, new_grid, num_tasks, metadata, moves, words, width, height, allowed_wasted, min_piece_area, next_lists, next_counts, next_buffer_ptr, buffer_end)) return true;
        } else {
            // Next task
            int next_idx = task_idx + 1;
            if (next_idx >= num_tasks) return true;
             // next task start move idx is 0
            if (solve_rec(next_idx, metadata[next_idx * 3 + 0], 0, new_grid, num_tasks, metadata, moves, words, width, height, allowed_wasted, min_piece_area, next_lists, next_counts, next_buffer_ptr, buffer_end)) return true;
        }
    }
    
    return false;
}

int solve(uint64_t* moves, int32_t* metadata, int num_tasks, int words, int width, int height, int allowed_wasted, int min_piece_area) {
    if (num_tasks == 0) return 1;
    if (words > MAX_WORDS) return -1;
    
    // Allocate buffer
    // Estimate size: Depth 500 * NumTasks 10 * MaxMoves 20000 * 4 bytes
    // 400 MB.
    size_t buf_size = 400 * 1024 * 1024 / sizeof(int); 
    int* buffer = (int*)malloc(buf_size * sizeof(int));
    if (!buffer) return -2;
    
    int* buffer_ptr = buffer;
    int* buffer_end = buffer + buf_size;
    
    int* current_lists[100];
    int current_counts[100];
    
    // Initialize lists with all moves
    for (int t = 0; t < num_tasks; t++) {
        int num_moves = metadata[t * 3 + 1];
        current_lists[t] = buffer_ptr;
        for (int i = 0; i < num_moves; i++) {
            buffer_ptr[i] = i;
        }
        current_counts[t] = num_moves;
        buffer_ptr += num_moves;
    }
    
    uint64_t initial_grid[MAX_WORDS];
    memset(initial_grid, 0, sizeof(uint64_t) * words);
    
    bool result = solve_rec(0, metadata[0], 0, initial_grid, num_tasks, metadata, moves, words, width, height, allowed_wasted, min_piece_area, current_lists, current_counts, buffer_ptr, buffer_end);
    
    free(buffer);
    return result ? 1 : 0;
}
