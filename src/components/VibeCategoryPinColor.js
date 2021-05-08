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
import axios from '../api';
import { useState, useEffect } from 'react';
import { getUserData } from '../localStorage';
import { Rating } from '@material-ui/lab';
import _, { map } from 'underscore';
import Modal from './Modal';
import 'intl-tel-input/build/css/intlTelInput.css';
import './SettingPage.css';
import TimePicker from 'rc-time-picker';
import 'rc-time-picker/assets/index.css';
import moment from 'moment';
import { Alert } from 'antd';

const vibeCategoryPinsColor = ['red', 'green', 'yellow'];

export default (props) => {

  const [showPopup, setShowPopup] = useState(false);
  const [success, setSuccess] = useState(true); 
  const [error, setError] = useState({});
  const [message, setMessage] = useState(''); 
  const [vibeCategories , setVibeCategories ] = useState([]);
  const [currentVibeCategory, setCurrentVibeCategory] = useState(null);
  const [vibeCategoryColor , setVibeCategoryColor] = useState(null);

  const validate = () => {
    let errors = {}
    let isValid = true;

    if(!currentVibeCategory && !vibeCategoryColor ){
      isValid = false;
      errors["endScheduleTime"] = " End Schedule Time Should Be Greater Than Starting Time."
    }
    
    if(isValid){
      return true
    }
    setError(errors)
    return false
  }

  
  const submitForm = async () => {
    if(validate()){
      const body = {
        vibeCategories
      }

      try{
        console.log("the body", body)
        const {data} = await axios.post(`/updateMapPinColor`, body)
        console.log("the data", data)
        if(data.settings.vibeCategoryPinsColor){
          setMessage("Map Pins Color Successfully Updated")
          setSuccess(true)
          setShowPopup(true)
        }
        else{
          setMessage("Map Pins Color Not Successfully Updated")
          setSuccess(false)
          setShowPopup(true)
        }
      
      }catch(err){
        console.log("the error below", err) 
        setShowPopup(true)
        setMessage("Schedulling Not SuccessFully Start")
        setSuccess(false);
      }
    }
    
  }
  
  

  useEffect(() => {
    const fetchData = async() => {
      try{
        const getDefaultSettings = await axios.get('/getdefaultSettings');
        const settings = getDefaultSettings.data.settings;
        console.log("the settings", settings)
        setVibeCategories(settings.vibeCategoryPinsColor)
        setCurrentVibeCategory(settings.vibeCategoryPinsColor[0].name)
        setVibeCategoryColor(settings.vibeCategoryPinsColor[0].color)
      }catch(err){
        console.log("the error", err);
      }
    }
    fetchData();
  }, []);

  const onChange = (event) => {
    const { name, value } = event.target;
    if(name === "vibeCategory"){
      setCurrentVibeCategory(value)
      const updatedVibeCategory = vibeCategories.filter( vibeCategory => vibeCategory.name === value )[0].color;
      setVibeCategoryColor(updatedVibeCategory);
    }
    else{
      setVibeCategoryColor(value);
      const updatedVibeCategory = vibeCategories.map((vibeCategory)=> {
        if(vibeCategory.name === currentVibeCategory){
          return {
            ...vibeCategory,
            color: value
          }
        }
        else
          return vibeCategory
      })
      setVibeCategories(updatedVibeCategory )
    }

  }

  return(
    <div>
      <CContainer className = "form-container-width"  >
        <CRow>
          <Modal 
            showPopup = {showPopup} 
            success = {success} 
            history = {props.history} 
            message = {message} 
            notRedirect = {true}
            closeModal = {()=> setShowPopup(false)}
          />
        </CRow>
        <CRow>
          <CCol sm="12">
            <CForm onSubmit={submitForm} >
              <CFormGroup>
                <CLabel > Select Vibe Category  </CLabel>
                <select 
                  onChange = {onChange } 
                  name = "vibeCategory"
                  value = {currentVibeCategory}
                  style = {{ marginLeft: 20, width: '30%', padding: 5, border: '1px solid black', borderRadius: 10 }} 
                >
                  {
                    vibeCategories && vibeCategories.map((vibeCategory)=> {
                      return (
                        <option value = {vibeCategory.name}> {vibeCategory.name} </option>
                      )
                    })
                  }    
                </select>
              </CFormGroup>
              <CFormGroup>
                <CLabel style = {{ width: 135, position: 'relative', top: 10 }} > Select Vibe Category Pin Color  </CLabel>
                <select 
                  onChange = {onChange } 
                  name = "ageInterval"
                  value = {vibeCategoryColor}
                  style = {{ marginLeft: 20, width: '30%', padding: 5, border: '1px solid black', borderRadius: 10 }} 
                >
                  {
                    vibeCategoryPinsColor.map(color => {
                      return (
                        <option value = {color}> {color} </option>
                      )
                    })
                  }   
                </select>
              </CFormGroup>
            </CForm>
          </CCol>
        </CRow>
        {/* <CRow>
          <CCol
            style = {{ textAlign: 'center' }}
          >  
            <div>
              <CButton
                style = {{ marginBottom: 50, textAlign: 'center' }}
                color = "info"
                onClick = {()=>{ submitForm()  }}
              >
                Update Vibe Category Color
              </CButton>        
            </div>
          </CCol>
        </CRow> */}
      </CContainer>    
    </div>
  );
}