import React from 'react'
import { EditorView } from './views/EditorView'
import { RecoilRoot } from 'recoil'

import '@fontsource/roboto/300.css'
import '@fontsource/roboto/400.css'
import '@fontsource/roboto/500.css'
import '@fontsource/roboto/700.css'

const App = () => {
  return (
    <RecoilRoot>
      <EditorView />
    </RecoilRoot>
  )
}

export { App }
