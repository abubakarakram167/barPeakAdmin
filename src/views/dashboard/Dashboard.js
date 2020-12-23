import React, { lazy } from 'react'
import {
  CBadge,
  CButton,
  CButtonGroup,
  CCard,
  CCardBody,
  CCardFooter,
  CCardHeader,
  CCol,
  CProgress,
  CRow,
  CCallout,
  CContainer,
  CFormGroup,
  CLabel,
  CInput,
  CFormText,
  CForm

} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import {getUserData} from '../../localStorage';
import MainChartExample from '../charts/MainChartExample.js'

const WidgetsDropdown = lazy(() => import('../widgets/WidgetsDropdown.js'))
const WidgetsBrand = lazy(() => import('../widgets/WidgetsBrand.js'))

const Dashboard = (props) => {
  
  const {token} = getUserData();
  console.log("the token", token);
  if(!token)
    props.history.push('/login')

  return (
    <>
      <WidgetsDropdown />
      
    </>
  )
}

export default Dashboard
