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
  const [showTitleField, setShowTitleField] = useState(true);
  

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
    const {id} = props.match.params;

    let getId = '';
    if(id !== "null"){
      console.log("innnn", id)
      getId = id
    }else
      getId = "null";
    console.log("in submisiion id", getId)
    if(validate()){
      const body = {
        query:`
        mutation{
          createCategory(category: 
            { title : "${formData.title}", 
              imageUrl: "${formData.imageUrl}", 
              type: "sub_bar" }, id: "${getId}")
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
        console.log("therr", err.response)
      }  
    }

  }
  

  useEffect(() => {
    const fetchData = async() => {
      const {id} = props.match.params;
      const { token } = await getUserData();
      console.log("the id", id)
      if(id){
        const body = {
          query:`
          query{
            getCategory(id: "${id}"){
              title
              type
              imageUrl
              _id
            }
          }` 
        }
        try{
          const res = await axios.post(`graphql?`,body,{ headers: {
            'Authorization': `Bearer ${token}`
          } });
          let category = res.data.data.getCategory; 
          setFormData(category);
          if(category.type === "main_category" )
            setShowTitleField(false)
          console.log("the data", res.data.data.getCategory);
        }catch(err){
          console.log("the error", err.response)
        }
      }


    }
    fetchData();
  }, []);

  const {id} = props.match.params;

  return(
    <div>
      
      <CContainer style = {{ width: "50%" }}  >
        <CRow>
          <Modal showPopup = {showPopup} success = {success} history = {props.history} message = {"Category Added SuccessFully"} />
        </CRow>
        <CRow>
          <CCol sm = {12} >
          <p >Category Image</p>
            <br />
            <div style = {{ width: 300, height: 200, border: '1px solid black' }} >
            <img
              src = { formData.imageUrl }
              style = {{ width: 300, height: 200, border: '1px solid black' }}
            />
            </div>
            <Widget  showImage = {(url)=>  { setFormData(prevState => ({ ...prevState, imageUrl: url }));   }}  />
            {error.imageUrl &&  <Alert message="You Must Have to Select The Image" type="error" />  }
            <p>Please select Category Image</p>
          </CCol>  
        </CRow>
        { showTitleField &&
          (<CRow>
            <CCol sm="12">
              <CForm  >    
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
          </CRow>)
        }
        <CRow>
          <CCol>
          <CButton
            style = {{ marginTop: 100, marginBottom: 50 }}
            color = "info"
            onClick = {()=>{ submitForm()  }}
          >
           { id ? "Update Category" : "Add Category" } 
          </CButton>
          {/* <input type = "submit" />    */}
          </CCol>
        </CRow>
      </CContainer>    
    </div>
  );
}