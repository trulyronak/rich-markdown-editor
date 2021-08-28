import React from 'react'
import './App.css'
import RichMarkdownEditor from '../../src'

const defaultValue = `
\

|Stage|Direct Products|ATP Yields|
|---:|---:|---:|
|Glycolysis|2 ATP||
|^^|{yellow}(2 NADH)3--5 ATP2 NADH5 ATP||
|Pyruvaye oxidation|^^||

\

|Stage|Direct Products|ATP Yields|
|---:|---:|---:|
|Glycolysis|2 ATP||
|^^|{yellow}(2 NADH)3--5 ATP2 NADH5 ATP||
|Pyruvaye oxidation|^^||

`

function App() {

  return (
    <div className="App">
      <RichMarkdownEditor defaultValue={defaultValue} onChange={v => console.log(v())} />
    </div>
  )
}

export default App
