import { createRoot } from 'react-dom/client'
import './index.css'
import { createBrowserRouter, createRoutesFromElements, Route, RouterProvider } from 'react-router-dom'
import Home from './components/Home'
import Login from './components/Login'
import Signup from './components/Signup'
import Profile from './components/Profile'
import Track from './components/Track'
import { RecoilRoot } from 'recoil'
import { ToastContainer } from "react-toastify";
import Page from './components/Page'
import "react-toastify/dist/ReactToastify.css";
import WatchTrack from './components/WatchTrack'
import WatchPage from './components/WatchPage'

const router = createBrowserRouter(
  createRoutesFromElements(
    <>
      <Route path="/" element={<Home />}></Route>
      <Route path="/login" element={<Login />}></Route>
      <Route path="/signup" element={<Signup />}></Route>
      <Route path="/profile">
        <Route path=":userId" element={<Profile />}></Route>
      </Route>
      <Route path="/create">
        <Route path=":trackId" element={<Track />}></Route>
      </Route>
      <Route path="/page">
        <Route path=":pageId" element={<Page />}></Route>
      </Route>
      <Route path="/watch/track">
        <Route path=":trackId" element={<WatchTrack />}></Route>
      </Route>
      <Route path="/watch/page">
        <Route path=":pageId" element={<WatchPage />}></Route>
      </Route>
      <Route path="/*" element={<Home />}></Route>
    </>
  )
);

createRoot(document.getElementById("root")!).render(
  <RecoilRoot>
    <RouterProvider router={router} />
    <ToastContainer position="top-right" autoClose={2000} />
  </RecoilRoot>
);
