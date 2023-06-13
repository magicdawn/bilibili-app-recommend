import { APP_NAME } from '$common'
import { AntdApp } from '$components/AntdApp'
import { PureRecommend } from '$components/PureRecommend'
import {
  Outlet,
  Route,
  RouterProvider,
  createHashRouter,
  createRoutesFromElements,
} from 'react-router-dom'

const router = createHashRouter(
  createRoutesFromElements(
    <Route path='/' element={<Root />}>
      <Route index element={<PureRecommend />} />
      <Route path='only-follow' element={<PureRecommend />} />
      <Route path='dynamic' element={<PureRecommend />} />
      <Route path='watchlater' element={<PureRecommend />} />
    </Route>
  ),
  { basename: `/${APP_NAME}/` }
)

function Root() {
  return (
    <AntdApp>
      <Outlet />
    </AntdApp>
  )
}

export function RouterApp() {
  return <RouterProvider router={router} />
}
