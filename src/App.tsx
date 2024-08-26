import './App.css'
import Audio0 from './Audio0'
import Audio1 from './Audio1'
import Audio3 from './Audio3'
import InputAnalyzer from './InputAnalyzer'
import NoiseGen1 from './NoiseGen1'
import Process3 from './Process3'
import ToneGen1 from './ToneGen1'

function App() {
  return (
    <>
      <h1>FELC 2024-08-20. Web Audio!</h1>
      <div className="card">
        {/* <Audio0></Audio0> */}
        {/* <Audio1></Audio1> */}
        <Audio3></Audio3>
        {/* <ToneGen1></ToneGen1> */}
        {/* <NoiseGen1></NoiseGen1> */}
        {/* <Process3></Process3> */}
        {/* <InputAnalyzer></InputAnalyzer> */}
      </div>
    </>
  )
}

export default App
