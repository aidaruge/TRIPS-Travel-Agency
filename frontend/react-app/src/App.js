import './App.css';
import { Routes, Route } from "react-router-dom";

import Home from './routes/Home';
import About from './routes/About';
import Contact from './routes/Contact';
import Destinations from './routes/Destinations';
import DestinationPage from './routes/DestinationPage';
import SignIn from './routes/SignInPage';
import SignUp from './routes/SignUpPage';
import Favorites from './routes/Favorites';
import Reservations from './routes/Reservations';
import EditDestination from './routes/EditDestination'; // Import the EditDestination component

function App() {
  return (
    <div className="App">
      <Routes>
        <Route path='/' element={<Home/>}/>
        <Route path='/about' element={<About/>}/>
        <Route path='/destinations' element={<Destinations/>}/>
        <Route path='/contact' element={<Contact/>}/>
        <Route path='/signin' element={<SignIn/>}/>
        <Route path='/signup' element={<SignUp/>}/>
        <Route path='/destinations/:id' element={<DestinationPage />} />
        <Route path='/favorites' element={<Favorites/>}/>
        <Route path='/reservations' element={<Reservations/>}/>
        <Route path='/edit/:id' element={<EditDestination />} />
      </Routes>
    </div>
  );
}

export default App;
