import React, { useState } from 'react'
import axios from '../../../api';
import {
  CButton,
  CCard,
  CCardBody,
  CCardGroup,
  CCol,
  CContainer,
  CForm,
  CInput,
  CInputGroup,
  CInputGroupPrepend,
  CInputGroupText,
  CRow
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import {storeUserData, getUserData} from '../../../localStorage';
import { Alert } from 'antd';
import './login.css';

const Login = (props) => {
  
  const [formData, setFormData] = useState({ email: '', password: '' }); 
  const [error, setError] = useState({});
  const [ invalidUser, setInvalidUser ] = useState(false);

  const validate = () => {
    let errors = {}
    let isValid = true;

    if(formData.email === "" || formData.email === undefined){
      console.log("title")
      isValid = false;
      errors["email"] = "email is required"
    }
    if(formData.password === "" || formData.password === undefined){
      console.log("short")
      isValid = false;
      errors["password"] = "Password is required"
    }
    
    if(isValid){
      return true
    }
    setError(errors)
    return false
  }

  const onChange = (event) => {
    const { name, value } = event.target;
    setFormData(prevState => ({ ...prevState, [name]: value }));
  }


  const submit = () => {
    const body = {
      query:`
      query{
        login(email: "${formData.email}", password: "${formData.password}")
        {
          token,
          user{
            _id
            firstName
            radius
            lastName
            email
            dob
          }
        }
      }`
    }
    console.log("the form data", formData);

    if(validate()){
      axios.post(`graphql?`,body).then((res)=>{
        console.log("the response", res);
        if(res.data.data.login){
          storeUserData(res.data.data.login)
          props.history.push('/')
        }
      }).catch(err => {
        const {errors} =  err.response.data; 
        const { message } = errors[0]; 
        setInvalidUser(true)
      })
    }
  }

  return (
    <div className="c-app c-default-layout flex-row align-items-center">
      <CContainer>
        <CRow className="justify-content-center">
          <CCol md="5">
            <CCardGroup>
              <CCard className="p-4">
                <CCardBody>
                  <CForm>
                    <h1>Login</h1>
                    {invalidUser &&  <Alert className = "invalid-alert" message="Invalid Username or Password" type="error" />  }
                    <p className="text-muted">Sign In to your account</p>
                    <div>
                      {error.email &&  <Alert message="email is required is required" type="error" />  }
                    </div>
                    <CInputGroup className="mb-3">
                      <CInputGroupPrepend>
                        <CInputGroupText>
                          <CIcon name="cil-user" />
                        </CInputGroupText>
                      </CInputGroupPrepend>
                      <CInput 
                        name = "email" 
                        type="email" 
                        placeholder="Email" 
                        autoComplete="email"
                        onChange = { onChange } 
                      />
                    </CInputGroup>
                    {error.password &&  <Alert message="password is required" type="error" />  }
                    <CInputGroup className="mb-4">
                      <CInputGroupPrepend>
                        <CInputGroupText>
                          <CIcon name="cil-lock-locked" />
                        </CInputGroupText>
                      </CInputGroupPrepend>
                      <CInput 
                        name = "password" 
                        type="password" 
                        placeholder="Password" 
                        autoComplete="current-password"
                        onChange = { onChange } 
                      />
                    </CInputGroup>
                    <CRow>
                      <CCol xs="6">
                        <CButton  onClick = {()=> submit()} color="primary" className="px-4">Login</CButton>
                      </CCol>
                      {/* <CCol xs="6" className="text-right">
                        <CButton color="link" className="px-0">Forgot password?</CButton>
                      </CCol> */}
                    </CRow>
                  </CForm>
                </CCardBody>
              </CCard>
              {/* <CCard className="text-white bg-primary py-5 d-md-down-none" style={{ width: '44%' }}>
                <CCardBody className="text-center">
                  <div>
                    <h2>Sign up</h2>
                    <p>Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut
                      labore et dolore magna aliqua.</p>
                    <Link to="/register">
                      <CButton color="primary" className="mt-3" active tabIndex={-1}>Register Now!</CButton>
                    </Link>
                  </div>
                </CCardBody>
              </CCard> */}
            </CCardGroup>
          </CCol>
        </CRow>
      </CContainer>
    </div>
  )
}

export default Login
