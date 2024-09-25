import { BrowserRouter, Route, Routes } from "react-router-dom"
import AnalyzePage from "./page/analyze/analyze"
import HomePage from "./page/home/home"

function App() {

  return <BrowserRouter>
    <Routes>
      <Route path="/analyze" element={<AnalyzePage />} />
      <Route path="/home" element={<HomePage />} />
      <Route path='*' element={<NotFound />} />
    </Routes>
  </BrowserRouter>
}

function NotFound(){
  return <div>404 Not Founds</div>
}


export default App;
