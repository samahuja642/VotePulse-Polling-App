import { Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout.jsx';
import Home from './pages/Home.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import CreatePoll from './pages/CreatePoll.jsx';
import PollDetail from './pages/PollDetail.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Explore from './pages/Explore.jsx';
import NotFound from './pages/NotFound.jsx';
import ProtectedRoute from './components/auth/ProtectedRoute.jsx';

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        {/* Public */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/polls/:id" element={<PollDetail />} />
        <Route path="/explore" element={<Explore />} />

        {/* Auth required */}
        <Route element={<ProtectedRoute />}>
          <Route path="/polls/new" element={<CreatePoll />} />
          <Route path="/dashboard" element={<Dashboard />} />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
