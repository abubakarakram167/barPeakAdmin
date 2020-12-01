import {
  CRow,
  CCol,
  CContainer,
  CFormGroup,
  CLabel,
  CInput,
  CFormText,
  CForm,
  CTextarea,
  CButton
 } from '@coreui/react'
import axios from '../../api';
import AxiosApi from 'axios';
import { useState, useEffect } from 'react';
import { getUserData } from '../../localStorage';
import { Rating } from '@material-ui/lab';
import BusinessCard from '../Business/BusinessCard';
import _, { map } from 'underscore';
import { ToastContainer } from 'react-toastify';
import { MDBNotification } from "mdbreact";
import { Alert } from 'antd';
import Modal from '../../components/Modal';
import Widget from '../../components/Widget';

export default (props) => {
  
  const [formData, setFormData] = useState({
    title: '',
    imageUrl: ''
  });
  
  const [error, setError] = useState({})
  const [showPopup, setShowPopup] = useState(false);
  const [success, setSuccess] = useState(true);

  const onChange = (event) => {
    const { name, value } = event.target;
    setFormData(prevState => ({ ...prevState, [name]: value }));
  }

  const validate = () => {
    let errors = {}
    let isValid = true;
    console.log("the title", formData.title)
    if(formData.title === "" || formData.title === undefined){
      console.log("title")
      isValid = false;
      errors["title"] = "Please input title"
    }
    if(formData.imageUrl === "" || formData.imageUrl === undefined){
      console.log("short")
      isValid = false;
      errors["imageUrl"] = "Please input short Description"
    }

    console.log("isValid", isValid)
    if(isValid){
      return true
    }
    setError(errors)
    return false
  }

  const submitForm = async () => {
    const { token } = await getUserData();

    if(validate()){
      const body = {
        query:`
        mutation{
          createCategory(category: 
            { title : "${formData.title}", 
              imageUrl: "${formData.imageUrl}", 
              type: "sub_bar" })
              {
              title
              }
        }`
        
      }
      try{
        const res = await axios.post(`graphql?`,body,{ headers: {
          'Authorization': `Bearer ${token}`
        } })
        console.log("the response on getting data", res.data.data);
        if(res.data.data.createCategory){
          setShowPopup(true)
        } 
      }catch(err){

      }  
    }

  }
  

  useEffect(() => {
    const fetchData = async() => {
      const { token } = await getUserData();
    
    }
    fetchData();
  }, []);

    

  return(
    <div>
      
      <CContainer style = {{ width: "50%" }}  >
        <CRow>
          <Modal showPopup = {showPopup} success = {success} history = {props.history} message = {"Category Added SuccessFully"} />
        </CRow>
        <CRow>  
        </CRow>
        <CRow>
          <CCol sm="12">
            <CForm onSubmit={submitForm} >
              <CFormGroup>
                <CLabel htmlFor="nf-email">Category Image</CLabel>
                <br />
                <div style = {{ width: 300, height: 200, border: '1px solid black' }} >
                <img
                  src = { formData.imageUrl }
                  style = {{ width: 300, height: 200, border: '1px solid black' }}
                />
                </div>
                <Widget  showImage = {(url)=>  { setFormData(prevState => ({ ...prevState, imageUrl: url }));   }}  />
                {error.imageUrl &&  <Alert message="You Must Have to Select The Image" type="error" />  }
                <CFormText className="help-block">Please select Category Image</CFormText>
              </CFormGroup>
              
              <CFormGroup>
                <CLabel htmlFor="nf-email">Title</CLabel>
                <CInput
                  type="text"
                  id="title"
                  name="title"
                  required
                  placeholder="Enter title.."
                  value = { formData.title }
                  onChange = { onChange }
                />
                {error.title &&  <Alert message="Please title is required" type="error" />  }
                <CFormText className="help-block">Please enter your Title</CFormText>
              </CFormGroup>
              
            </CForm>
          </CCol>
        </CRow>
        <CRow>
          <CCol>
          <CButton
            style = {{ marginTop: 100, marginBottom: 50 }}
            color = "info"
            onClick = {()=>{ submitForm()  }}
          >
            ADD Category
          </CButton>
          {/* <input type = "submit" />    */}
          </CCol>
        </CRow>
      </CContainer>    
    </div>
  );
}