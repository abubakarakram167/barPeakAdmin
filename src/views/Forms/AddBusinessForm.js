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
import { useState, useEffect } from 'react';
import { getUserData } from '../../localStorage';
import { Rating } from '@material-ui/lab';
import _, { map } from 'underscore';
import Modal from '../../components/Modal';
import { Alert } from 'antd';
import { Row, Col } from 'antd';
import 'intl-tel-input/build/css/intlTelInput.css';
import Widget from '../../components/Widget';
import './formContainer.css';
export default (props) => {
  
  const [allCateogories, setCategories]=useState([]);
  const [isBar, setBar]=useState(false);
  const [formData, setFormData] = useState({category: [], uploadedPhotos: [], ageInterval: 'young', ratioType: 'boy' });
  const [ratingData, setRatingData] = useState({
    fun: 2,
    crowd: 2,
    ratioInput: 2,
    difficultyGettingIn: 2,
    difficultyGettingDrink: 2 
  });
  const [googleDetailData, setGoogleDetailData] = useState({});
  const [showPopup, setShowPopup] = useState(false);
  const [success, setSuccess] = useState(true); 
  const [error, setError] = useState({})
  
  const selectedcategoryIds = []

  const onChange = (event) => {
    const { name, value } = event.target; 
    setFormData(prevState => ({ ...prevState, [name]: value }));
  }

  const onChangeCategory = (event) => {
    const { value } = event.target;
    let selectedcategoryIds = formData.category;
    
    if(selectedcategoryIds.includes(value)){
      selectedcategoryIds = selectedcategoryIds.filter( id => id !== value )
    }
    else
      selectedcategoryIds.push(value)  
   
    const specificCategory = allCateogories.filter(category => selectedcategoryIds.includes(category._id)).map(category => category._id) 
    const barCategoryTitle = allCateogories.filter(category => selectedcategoryIds.includes(category._id) ).map(category => category.title)
    
    console.log("the bar category title")
    if( barCategoryTitle.includes("bar") )
      setBar(true)
    else
      setBar(false) 
    
    setFormData(prevState => ({ ...prevState, category: specificCategory }));
  }

  
  const onChangeRating = (event) => {
    const { name, value } = event.target;
    setRatingData(prevState => ({ ...prevState, [name]: value }));
  }

  const validate = () => {
    let errors = {}
    let isValid = true;
    console.log("the title", formData.title)
    if(formData.name === "" || formData.name === undefined){
      console.log("title")
      isValid = false;
      errors["title"] = "Please input title"
    }
    if(formData.category.length === 0 || formData.category === undefined ){
      console.log("category")
      isValid = false;
      errors["category"] = "Please input category"
    }
    if(formData.address === '' || formData.address === undefined ){
      isValid = false;
      errors["address"] = "Please input address"
    }
    if(formData.latitude === '' || formData.latitude === undefined ){
      isValid = false;
      errors["latitude"] = "Please input latitude"
    }
    if(formData.longitude === '' || formData.longitude === undefined ){
      isValid = false;
      errors["latitude"] = "Please input longitude"
    }
    
    console.log("isValid", isValid)
    if(isValid){
      return true
    }
    setError(errors)
    return false
  }

  const getPhotos = () => {
    let totalPhotos = ''
    formData.uploadedPhotos.map((photo)=>{
    totalPhotos = totalPhotos + photo.secure_url  + ','
    })
    return totalPhotos
    
  }

  const submitForm = async () => {
    const { token } = await getUserData();
    const allPhotos = getPhotos().slice(0,-1);
   
    if(validate()){
      const body = {
        query:` 
        mutation{
          createBusiness(businessInput: {
              photos: "${ allPhotos }"
              category: "${formData.category.toString()}",
              name: "${formData.name}",
              ageInterval: "${formData.ageInterval}",
              ratioType: "${formData.ratioType}",
              rating:{
                fun: ${ratingData.fun}
                crowd: ${ratingData.crowd}
                ratioInput: ${ratingData.ratioInput}
                difficultyGettingIn: ${ratingData.difficultyGettingIn}
                difficultyGettingDrink : ${ratingData.difficultyGettingDrink}
              },
              customData:{
                rating: ${formData.rating},
                address: "${formData.address}"
                latitude: ${formData.latitude},
                longitude: ${formData.longitude},
                phoneNo: "${formData.phoneNo}"
              }
          })
          { _id
            name    
          }
        }
        `
      }
      try{
        const res = await axios.post(`graphql?`,body,{ headers: {
          'Authorization': `Bearer ${token}`
        } })
        if(res.data.data.createBusiness){
          setShowPopup(true)
        } 
        console.log("the response after getting business", res); 
      }catch(err){
        // if(err.response.data){
        //   console.log("the error", err.data.errors.length)
        // }
        setShowPopup(true)
        setSuccess(false);
        console.log("the error below", err.response)
        
      }
    }
  }
  

  useEffect(() => {
    const fetchData = async() => {
      const { token } = await getUserData();
      const body = {
        query:`
        query{
          getCategories{
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
       
        const allSpecificCategories = res.data.data.getCategories
        setCategories(allSpecificCategories);
      }catch(err){
        console.log("the error", err.response);
      }
    }
    fetchData();
  }, []);

  console.log("the form data photos", formData.uploadedPhotos)

  return(
    <div>
      <CContainer className = "form-container-width"  >
        <CRow>
          <Modal showPopup = {showPopup} success = {success} history = {props.history} message = {"Business Updated SuccessFully"} />
        </CRow>
        <CRow>
          <CCol sm = "12" >     
            <CRow>
              <CCol sm = {12} >
                <p >Business Image</p>
                <br />
                <div style = {{ width: 300, height: 200, border: '1px solid black' }} >
                <img
                  src = { formData.uploadedPhotos.length &&  formData.uploadedPhotos[0].secure_url }
                  style = {{ width: 300, height: 200, border: '1px solid black' }}
                />
                </div>
                <Widget  
                  showImage = {(url)=>  { 
                    console.log("the url incomng", url)
                    setFormData(prevState => ({ ...prevState, uploadedPhotos: formData.uploadedPhotos.concat(url) }));   
                  }}  
                />
                {error.imageUrl &&  <Alert message="You Must Have to Select The Image" type="error" />  }
                <p>Please select Category Image</p>
              </CCol>  
            </CRow>          
          </CCol>
        </CRow>
        <CRow>
          <CCol sm="12">
            <CForm onSubmit={submitForm} >
              <CFormGroup>
                <CLabel htmlFor="nf-email">Title</CLabel>
                <CInput
                  type="text"
                  id="title"
                  name="name"
                  placeholder="Enter title.."
                  value = { formData.name }
                  onChange = { onChange }
                />
                {error.title &&  <Alert message="Please title is required" type="error" />  }
                <CFormText className="help-block">Please enter your Title</CFormText>
              </CFormGroup>
              <CFormGroup>
                <CLabel >Address</CLabel>
                <CInput
                  type="text"
                  id="address"
                  name="address"
                  placeholder="Enter address.."
                  value = { formData.address }
                  onChange = { onChange }
                />
                {error.address &&  <Alert message="Address is required" type="error" />  }
                <CFormText className="help-block">Please enter your Address</CFormText>
              </CFormGroup>
              <CFormGroup>
                <CLabel >Latittude</CLabel>
                <CInput
                  type="number"
                  id="latitude"
                  name="latitude"
                  placeholder="Enter latitude.."
                  value = { formData.latitude }
                  onChange = { onChange }
                />
                {error.latitude &&  <Alert message="Latitude is required" type="error" />  }
                <CFormText className="help-block">Please enter Correct Latittude</CFormText>
              </CFormGroup>
              <CFormGroup>
                <CLabel >Longitude</CLabel>
                <CInput
                  type="number"
                  id="longitude"
                  name="longitude"
                  placeholder="Enter longitude.."
                  value = { formData.longitude }
                  onChange = { onChange }
                />
                {error.latitude &&  <Alert message="Longitude is required" type="error" />  }
                <CFormText className="help-block">Please enter Correct Longitude </CFormText>
              </CFormGroup>
              <CFormGroup>
                <CLabel >Rating</CLabel>
                <CInput
                  type="number"
                  id="rating"
                  name="rating"
                  placeholder="Enter Google Rating.."
                  value = { formData.rating }
                  onChange = { onChange }
                  max= {5}
                  min = {1}
                />
                {error.rating &&  <Alert message="Rating is required" type="error" />  }
                <CFormText className="help-block">Please enter Google Rating </CFormText>
              </CFormGroup>
              <CFormGroup>
                <CLabel >PHone No</CLabel>
                <input 
                  type="tel" 
                  name="phoneNo" 
                  id="phone" 
                  pattern="(?:\(\d{3}\)|\d{3})[- ]?\d{3}[- ]?\d{4}" 
                  maxlength="14" title="US based Phone Number in the format of: (123) 456-7890" 
                  placeholder="(xxx) xxx-xxxx" 
                  required
                  onChange = { onChange } 
                  />  
                <CFormText className="help-block">Please Select Phone No</CFormText>
              </CFormGroup>        
              <CFormGroup>
                <CLabel >Category</CLabel>
                  <Row>
                    { allCateogories.map((category)=>{
                          if(category.type === "main_category"){
                            return(
                              <Col span={8}>
                                <label>
                                <input type="checkbox" name = "category" value = { category._id } onChange={onChangeCategory} />
                                 {category.title}
                                </label>
                              </Col>
                            );
                          }  
                        })
                      }
                  </Row>       
                {error.category &&  <Alert message="Select Atleast one category" type="error" />  }
                <CFormText className="help-block">Please Select Category</CFormText>
              </CFormGroup>
              { isBar &&
                (<CFormGroup>
                  <CLabel >Bar Category</CLabel>
                  <select 
                    onChange = { onChange } 
                    name = "barCategory"
                    value = { !_.isEmpty(formData) && formData.barCategory &&formData.barCategory._id }
                    style = {{ marginLeft: 20, width: '30%', padding: 5, border: '1px solid black', borderRadius: 10 }} 
                  >
                    { allCateogories.map((category)=>{
                        if(category.type === "sub_bar"){
                          return(
                            <option value = {category._id}>{ category.title }</option>
                          );
                        }  
                      })
                    }
                  </select>
                  {error.barcategory &&  <Alert message="category is required" type="error" />  }
                  <CFormText className="help-block">Please Select Bar Category</CFormText>
                </CFormGroup>)
              }
              <CFormGroup>
                <CLabel >AgeInterval</CLabel>
                <select 
                  onChange = {onChange } 
                  name = "ageInterval"
                  value = {formData.ageInterval}
                  style = {{ marginLeft: 20, width: '30%', padding: 5, border: '1px solid black', borderRadius: 10 }} 
                >
                  <option selected value="young">21-25</option>
                  <option value="elder">26-40</option>
                  <option value="all">All</option>
                </select>
                <CFormText className="help-block">Please Select Age</CFormText>
              </CFormGroup>
              <p style = {{ fontSize: 20 }} >Rating:</p>
              <CFormGroup>
                <CLabel style = {{ fontSize: 20 }} > Fun :</CLabel>
                <span style = {{ position: 'relative', top: 5, left: 20 }} >
                  <Rating name="fun"  value = { ratingData.fun ? ratingData.fun : 2  } onChange = { onChangeRating } size="large" precision = {0.1} max = {5} />
                </span>  
                <span style = {{ marginLeft: 30, fontSize: 20 }} > { ratingData.fun } </span>
                <hr />

                <CLabel style = {{ fontSize: 20 }} > Crowd :</CLabel>
                <span style = {{ position: 'relative', top: 5, left: 20 }} >
                  <Rating name="crowd" value = { ratingData.crowd ? ratingData.crowd : 3  }  onChange = {onChangeRating } size="large" precision = {0.1} max = {5} />
                </span>  
                <span style = {{ marginLeft: 30, fontSize: 20 }} >{ ratingData.crowd }</span>
                <hr />

                <select 
                  onChange = {onChange } 
                  name = "ratioType"
                  value = { formData.ratioType }
                  className = "ratio-select" 
                >
                  <option selected value="girl">girlToGuyRatio</option>
                  <option value="boy">boyToGirlRatio</option>
                </select>
                <span style = {{ position: 'relative', top: 5, left: 20 }} >
                  <Rating name="ratioInput" value={ratingData.ratioInput} onChange = {onChangeRating} size="large" precision = {0.1} max = {5} />
                </span>  
                <span style = {{ marginLeft: 30, fontSize: 20 }} >{ ratingData.ratioInput }</span>
                <hr />

                <CLabel style = {{ fontSize: 20 }} > difficultyGettingIn :</CLabel>
                <span style = {{ position: 'relative', top: 5, left: 20 }} >
                  <Rating name = "difficultyGettingIn" value = { ratingData.difficultyGettingIn ? ratingData.difficultyGettingIn : 2 }  onChange = {onChangeRating} size="large" precision = {0.1} max = {5} />
                </span>  
                <span style = {{ marginLeft: 30, fontSize: 20 }} >{ ratingData.difficultyGettingIn }</span>
                <hr />

                <CLabel style = {{ fontSize: 20 }} > difficultyGettingDrink :</CLabel>
                <span style = {{ position: 'relative', top: 5, left: 20 }} >
                  <Rating name = "difficultyGettingDrink" value = { ratingData.difficultyGettingDrink ? ratingData.difficultyGettingDrink : 2  }  onChange = {onChangeRating} size="large" precision = {0.1} max = {5} />
                </span>  
                <span style = {{ marginLeft: 10, fontSize: 20 }} > { ratingData.difficultyGettingDrink } </span>   
              </CFormGroup>
            </CForm>
          </CCol>
        </CRow>
        <CRow>
          <CCol
            style = {{ textAlign: 'center' }}
          >
            <CButton
              style = {{ marginTop: 100, marginBottom: 50, textAlign: 'center' }}
              color = "info"
              onClick = {()=>{ submitForm()  }}
            >
              Add Business
            </CButton>
          </CCol>
        </CRow>
      </CContainer>    
    </div>
  );
}