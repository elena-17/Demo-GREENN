import { Suspense, lazy } from 'react';
import { HashRouter as Router, Routes, Route, Navigate  } from 'react-router-dom';
import AuthLayout from './pages/authLayout';
import MainLayout from './pages/mainLayout';
import { Center, Loader, LoadingOverlay } from '@mantine/core';

const HomePage = lazy(() => import('./pages/homePage'));
const ProjectDetail = lazy(() => import('./pages/projectDetail'));
const TestCaseDetail = lazy(() => import('./pages/testCaseDetail'));
const EditTestCase = lazy(() => import('./pages/editTestCase'));
const NewTestCase = lazy(() => import('./pages/newTestCase'));
const NotFound = lazy(() => import('./pages/not-found'));
const ProjectList = lazy(() => import('./pages/projectList'));
const Help = lazy(() => import('./pages/help'));

const AdminUsersPanel = lazy(() => import('./pages/admin/adminUsersPanel'));
const ManageDatasets = lazy(() => import('./pages/admin/manageDatasets'));
const AdminHomepage = lazy(() => import('./pages/admin/adminLayout'));
const ManageProjects = lazy(() => import('./pages/admin/manageProjects'));
const AdminHome = lazy(() => import('./pages/admin/adminHome'));
const ManageJobs = lazy(() => import('./pages/admin/manageJobs'));

function App() {
  return (
    <Router>
      <Suspense
        fallback={
          <Center style={{ height: '100vh' }}>
            <Loader size="lg" type="dots" />
          </Center>
        }
      >
        <Routes>
          {/* <Route path="/" element={<AuthLayout />} /> */}
          <Route path="/admin" element={<AdminHomepage />}>
            <Route path="" element={<AdminHome />} />
            <Route path="datasets" element={<ManageDatasets />} />
            <Route path="users" element={<AdminUsersPanel />} />
            <Route path="projects" element={<ManageProjects />} />
            <Route path="jobs" element={<ManageJobs />} />
          </Route>
          <Route path="/" element={<MainLayout />}>
            <Route index element={<Navigate to="homepage" replace />} />
            <Route path="homepage" element={<HomePage />} />
            <Route path="help" element={<Help />} />
            <Route path="projects" element={<ProjectList />} />
            <Route path="projects/:projectID" element={<ProjectDetail />} />
            <Route path="testCases/:testCaseID" element={<TestCaseDetail />} />
            <Route path="testCases/:testCaseID/edit" element={<EditTestCase />} />
            <Route path="newtestCase/:projectID" element={<NewTestCase />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </Router>
  );
}


export default App;
