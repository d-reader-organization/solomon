# solomon

> Utility library for frontend dapps built on Solana

[![NPM](https://img.shields.io/npm/v/@open-sauce/solomon)](https://www.npmjs.com/package/@open-sauce/solomon) [![JavaScript Style Guide](https://img.shields.io/badge/code_style-typescript-brightgreen.svg)](https://standardjs.com)

## Install

```bash
npm install @open-sauce/solomon
```

## Usage

```tsx
import React, { Component } from 'react'

import HoldersOnly from '@open-sauce/solomon'
import hashlist from './constants'

function App() {
  return (
    <HoldersOnly altContent="Only holders allowed" hashlist={hashlist}>
      Secret content
    </HoldersOnly>
  ) 
}
```

## License

MIT © [josip-volarevic](https://github.com/josip-volarevic)
