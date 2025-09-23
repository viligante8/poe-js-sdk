---
id: realms
title: Realms
---

Supported realms:

- `pc` – PC (default)
- `xbox` – Xbox
- `sony` – PlayStation
- `poe2` – Path of Exile 2

```ts
// PoE2 leagues
const poe2Leagues = await client.getLeagues('poe2');

// Xbox characters
const xboxChars = await client.getCharacters('xbox');
```

