#include <stdint.h>
#include <stdlib.h>
#include <stdbool.h>
#include <inttypes.h>

typedef long long ll;

static inline int digits_count(int64_t x) {
    if (x <= 0) return 1;
    int d = 0;
    while (x > 0) { x /= 10; d++; }
    return d;
}

static inline int64_t pow10i(int n) {
    int64_t r = 1;
    for (int i = 0; i < n; ++i) r *= 10;
    return r;
}

ll p1(ll* input, int count) {
    ll result128 = 0;
    for (int i = 0; i < count; ++i) {
        int64_t start = (int64_t)input[2*i];
        int64_t end = (int64_t)input[2*i+1];
        if (end < 10) continue;
        int maxLen = digits_count(end);
        int maxHalf = maxLen / 2;
        for (int half = 1; half <= maxHalf; ++half) {
            int64_t pow = pow10i(half);
            int64_t scale = pow + 1;
            int64_t minFirst = pow10i(half - 1);
            int64_t maxFirst = pow - 1;
            int64_t low = start / scale;
            if (start % scale != 0) low += 1;
            if (low < minFirst) low = minFirst;
            int64_t high = end / scale;
            if (high > maxFirst) high = maxFirst;
            if (low > high) continue;

            ll cnt = (high - low) + 1;
            ll sumFirst = (low + high) * cnt / 2;
            ll add = scale * sumFirst;
            result128 += add;
        }
    }
    return result128;
}

ll p2(ll* input, int count) {
    ll result128 = 0;
    for (int i = 0; i < count; ++i) {
        int64_t start = (int64_t)input[2*i];
        int64_t end = (int64_t)input[2*i+1];
        if (end < 10) continue;
        int maxLen = digits_count(end);

        size_t seenCap = 64;
        size_t seenLen = 0;
        int64_t *seen = (int64_t*)malloc(sizeof(int64_t) * seenCap);
        if (!seen) return 0; // out-of-memory guard

        for (int L = 1; L <= maxLen / 2; ++L) {
            int64_t powL = pow10i(L);
            int kMax = maxLen / L;
            for (int k = 2; k <= kMax; ++k) {
                int totalLen = L * k;
                ll powTotal = 1;
                for (int t = 0; t < totalLen; ++t) powTotal *= 10;
                ll powL128 = powL;
                if (powL128 - 1 == 0) continue;
                ll scale128 = (powTotal - 1) / (powL128 - 1);
                if (scale128 <= 0) continue;
                if (scale128 > INT64_MAX) continue;
                int64_t scale = (int64_t)scale128;

                int64_t minFirst = pow10i(L - 1);
                int64_t maxFirst = powL - 1;
                int64_t low = start / scale;
                if (start % scale != 0) low += 1;
                if (low < minFirst) low = minFirst;
                int64_t high = end / scale;
                if (high > maxFirst) high = maxFirst;
                if (low > high) continue;

                for (int64_t first = low; first <= high; ++first) {
                    ll num128 = first * scale128;
                    if (num128 < start || num128 > end) continue;
                    int64_t num = (int64_t)num128;
                    bool found = false;
                    for (size_t j = 0; j < seenLen; ++j) {
                        if (seen[j] == num) { found = true; break; }
                    }
                    if (!found) {
                        if (seenLen >= seenCap) {
                            seenCap *= 2;
                            int64_t *tmp = (int64_t*)realloc(seen, sizeof(int64_t) * seenCap);
                            if (!tmp) { free(seen); return 0; }
                            seen = tmp;
                        }
                        seen[seenLen++] = num;
                    }
                }
            }
        }

        for (size_t j = 0; j < seenLen; ++j) result128 += seen[j];
        free(seen);
    }
    return result128;
}
