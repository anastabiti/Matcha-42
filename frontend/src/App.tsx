import './App.css'
import { Route } from 'react-router-dom';
import RegistrationForm from './components/RegistrationForm';

import { Routes } from 'react-router-dom';
// function App() {
//   const [count, setCount] = useState(0)

//   return (
//     <>
//       <div>
//         <a href="https://vite.dev" target="_blank">
//           <img src={viteLogo} className="logo" alt="Vite logo" />
//         </a>
//         <a href="https://react.dev" target="_blank">
//           <img src={reactLogo} className="logo react" alt="React logo" />
//         </a>
//       </div>
//       <h1>Vite + React</h1>
//       <div className="card">
//         <button onClick={() => setCount((count) => count + 1)}>
//           count is {count}
//         </button>
//         <p>
//           Edit <code>src/App.tsx</code> and save to test HMR
//         </p>
//       </div>
//       <p className="read-the-docs">
//         Click on the Vite and React logos to learn more
//       </p>
//     </>
//   )
// }


import { BrowserRouter } from 'react-router-dom';
import LoginPage from './components/LoginPage';
import resetPassword from './components/resetPassword';
import Home_page from './components/home';
import Setup_page from './components/setup_page';

function App() {

  return (
    <>
        
      <div>
    <BrowserRouter>
      <Routes>
      <Route path="/register" Component={RegistrationForm} />  
      <Route path="/login" Component={LoginPage} />
      <Route path="/resetPassword" Component={resetPassword} />
      <Route path="/home" Component={Home_page} />
      <Route path="/setup" Component={Setup_page} />
      </Routes>
      </BrowserRouter>
      </div>

    </>
  );
}

export default App



//setup routing i used https://www.codementor.io/@riza/simplest-way-to-add-routing-in-react-23cgngoyas guide  atabiti