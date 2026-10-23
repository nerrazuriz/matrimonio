import { Outlet } from 'react-router-dom'
import PhaseStepper from '@/components/PhaseStepper'

export default function GuestLayout() {
  return (
    <>
      <PhaseStepper />
      <Outlet />
    </>
  )
}
