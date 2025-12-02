typedef long long ll;

static const ll POW10[20] = {
  1LL, 10LL, 100LL, 1000LL, 10000LL, 
  100000LL, 1000000LL, 10000000LL, 100000000LL, 
  1000000000LL, 10000000000LL, 100000000000LL, 1000000000000LL, 
  10000000000000LL, 100000000000000LL, 1000000000000000LL, 
  10000000000000000LL, 100000000000000000LL, 1000000000000000000LL,
};

static inline int get_len_fast(ll n) {
  if (n < 100000LL) {
    if (n < 100LL) return (n < 10LL) ? 1 : 2;
    if (n < 10000LL) return (n < 1000LL) ? 3 : 4;
    return 5;
  }
  if (n < 10000000000LL) {
    if (n < 100000000LL) return (n < 1000000LL) ? 6 : (n < 10000000LL) ? 7 : 8;
    return (n < 1000000000LL) ? 9 : 10;
  }
  for (int i = 11; i < 19; i++) {
    if (n < POW10[i]) return i;
  }
  return 19;
}

ll p1(ll* input, int count) {
  ll result = 0;
  for (int i = 0; i < count; i++) {
    ll start = input[i * 2];
    ll end = input[i * 2 + 1];

    for (ll x = start; x <= end; x++) {
      int len = get_len_fast(x);
      if (len & 1) continue;
      int half_len = len >> 1;
      ll splitter = POW10[half_len];
      ll lower = x % splitter;
      ll upper = x / splitter;
      if (lower == upper) result += x;
    }
  }
  return result;
}

ll p2(ll* input, int count) {
  ll result = 0;
  for (int i = 0; i < count; i++) {
    ll start = input[i * 2];
    ll end = input[i * 2 + 1];
    for (ll x = start; x <= end; x++) {
      int len = get_len_fast(x);
      for (int split = 1; split < len; split++) {
        if (len % split != 0) continue;
        ll multiplier = POW10[split];
        ll pattern = x % multiplier;
        if ((x / POW10[len - split]) != pattern) continue;
        ll reconstructed = pattern;
        int steps = (len / split) - 1;
        for (int k = 0; k < steps; k++) {
          reconstructed = reconstructed * multiplier + pattern;
        }
        if (reconstructed == x) {
          result += x;
          break;
        }
      }
    }
  }
  return result;
}