import { createRoot } from 'react-dom/client'
import './index.css'
import { createBrowserRouter, createRoutesFromElements, Route, RouterProvider } from 'react-router-dom'
import Home from './components/Home'
import Login from './components/Login'
import Signup from './components/Signup'
import Profile from './components/Profile'
import { RecoilRoot } from 'recoil'
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const router = createBrowserRouter(
  createRoutesFromElements(
    <>
      <Route path="/" element={<Home />}></Route>
      <Route path="/login" element={<Login />}></Route>
      <Route path="/signup" element={<Signup />}></Route>
      <Route path='/profile'>
        <Route path=':id' element={<Profile/>}></Route>
      </Route>
      <Route path='/*' element={<Home/>}></Route>
    </>
  )
);

createRoot(document.getElementById("root")!).render(
  <RecoilRoot>
    <RouterProvider router={router} />
    <ToastContainer position="top-right" autoClose={3000} />
  </RecoilRoot>
);
