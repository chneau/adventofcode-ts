#include <math.h>

typedef long long ll;

ll ipow(ll base, int exp) {
  ll res = 1;
  while (exp > 0) {
    if (exp % 2 == 1) res *= base;
    base *= base;
    exp /= 2;
  }
  return res;
}

int get_len(ll n) {
  if (n == 0) return 1;
  return (int)floor(log10((double)n)) + 1;
}

ll p1(ll pairs[][2], int count) {
  ll result = 0;
  for (int i = 0; i < count; i++) {
    for (ll x = pairs[i][0]; x <= pairs[i][1]; x++) {
      int len = get_len(x);
      if (len % 2 != 0) continue;

      int half_len = len / 2;
      ll splitter = ipow(10, half_len);
      
      ll lower = x % splitter; 
      ll upper = x / splitter;

      if (lower == upper) result += x;
    }
  }
  return result;
}

ll p2(ll pairs[][2], int count) {
  ll result = 0;
  for (int i = 0; i < count; i++) {
    for (ll x = pairs[i][0]; x <= pairs[i][1]; x++) {
      int len = get_len(x);
      
      for (int split = 1; split < len; split++) {
        if (len % split != 0) continue;

        ll divisor = ipow(10, split);
        ll pattern = x % divisor;
        ll temp = x;
        int valid = 1;

        while (temp > 0) {
          if ((temp % divisor) != pattern) {
            valid = 0;
            break;
          }
          temp /= divisor;
        }

        if (valid) {
          result += x;
          break;
        }
      }
    }
  }
  return result;
}
