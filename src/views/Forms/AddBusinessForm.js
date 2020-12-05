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

export default (props) => {
  
  const [allCateogories, setCategories]=useState([]);
  const [isBar, setBar]=useState(false);
  const [formData, setFormData] = useState({
    title: '',
    shortDescription: '',
    longDescription: '',
    category: '',
    ageInterval: 'young'
  });
  const [ratingData, setRatingData] = useState({
    fun: 5,
    crowd: 5,
    girlToGuyRatio: 5,
    difficultyGettingIn: 5,
    difficultyGettingDrink: 5
  });
  const [googleDetailData, setGoogleDetailData] = useState({});
  const [error, setError] = useState({})
  const [showPopup, setShowPopup] = useState(false);
  const [success, setSuccess] = useState(true); 

  const onChange = (event) => {
    const { name, value } = event.target;
    
    if(name === "category"){
      const specificCategory = allCateogories.filter(category => category._id === value)[0]
      console.log("the specific category", specificCategory);
      if(specificCategory.title === "bar")
        setBar(true)
      else
        setBar(false) 
    }

    setFormData(prevState => ({ ...prevState, [name]: value }));
  }

  
  const onChangeRating = (event) => {
    const { name, value } = event.target;
    setRatingData(prevState => ({ ...prevState, [name]: value }));
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
    if(formData.shortDescription === "" || formData.shortDescription === undefined){
      console.log("short")
      isValid = false;
      errors["shortDescription"] = "Please input short Description"
    }
    if(formData.longDescription === "" || formData.longDescription === undefined){
      console.log("long")
      isValid = false;
      errors["longDescription"] = "Please input long Description"
    }
    if(formData.ageInterval === "" || formData.ageInterval === undefined){
      isValid = false;
      errors["ageInterval"] = "Please select your age"
    }
    if(formData.category === "" || formData.category === undefined){
      console.log("category")
      isValid = false;
      errors["category"] = "Please input category"
    }
    // if( isBar && formData.barCategory === "" || formData.barCategory === undefined){
    //   console.log("barcate")
    //   isValid = false;
    //   errors["barCategory"] = "Please input bar Category"
    // }
    
    console.log("isValid", isValid)
    if(isValid){
      return true
    }
    setError(errors)
    return false
  }

  const submitForm = async () => {
    const { token } = await getUserData();
    const category = isBar ? formData.barCategory : formData.category;

    console.log("the form data", formData);
    console.log("the rating data", ratingData)

    if(validate()){
      const body = {
        query:` 
        mutation{
          createBusiness(businessInput: {
              category: "${category}",
              title: "${formData.title}",
              placeId: "${props.placeId}",
              ageInterval: "${formData.ageInterval}"
              rating:{
                fun: ${ratingData.fun}
                crowd: ${ ratingData.crowd }
                girlToGuyRatio: ${ratingData.girlToGuyRatio}
                difficultyGettingIn: ${ratingData.difficultyGettingIn}
                difficultyGettingDrink : ${ratingData.difficultyGettingDrink}
              }
              longDescription: "${formData.longDescription}",
              shortDescription: "${ formData.shortDescription}"
      
          })
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
        if(res.data.data.createBusiness){
          setShowPopup(true)
        } 
        console.log("the response after getting business", res); 
      }catch(err){
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
        const getSingleData = await axios.get(`http://localhost:3000/getSinglePlaceResult?place_id=${props.placeId}`);
        // console.log("the google detail data", getSingleData)
        const allSpecificCategories = res.data.data.getCategories
        setGoogleDetailData(getSingleData.data)
        setCategories(allSpecificCategories);
        
        const specificCategory = allSpecificCategories.filter( category => category._id === props.categoryId )[0];
        const barCategory = allSpecificCategories.filter( category => category.type === "sub_bar" )[0];
        console.log("the specific Catgoery", specificCategory);
        if (specificCategory.title === "bar"){
          setBar(true)
        }
        else{
          setBar(false)
        }
          
        setFormData({ category : specificCategory._id, barCategory: barCategory._id, ageInterval: "young" })
        
      }catch(err){
        console.log("the error", err);
      }
    }
    fetchData();
  }, []);

     console.log("the google detail data", googleDetailData)
  // console.log("form Data", formData)
  // console.log("the rating Data", ratingData);

  return(
    <div>
      
      <CContainer style = {{ width: "50%" }}  >
        <CRow>
          <Modal showPopup = {showPopup} success = {success} history = {props.history} message = {"Business Added SuccessFully"} />
        </CRow>
        <CRow>
          <MDBNotification
            show = {false}
            fade
            autohide = {3000}
            icon="envelope"
            iconClassName="green-text"
            title="Success"
            message="Business Sccessfull Added"
            text="1min ago"
          />
        </CRow>
        <CRow>
          <CCol sm = "12" >
            { !_.isEmpty(googleDetailData) &&
              <BusinessCard showLink = {false}  business = {googleDetailData} /> 
            } 
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
                  name="title"
                  required
                  placeholder="Enter title.."
                  defaultValue = {googleDetailData["name"]}
                  value = { formData.title }
                  onChange = { onChange }
                />
                {error.title &&  <Alert message="Please title is required" type="error" />  }
                <CFormText className="help-block">Please enter your Title</CFormText>
              </CFormGroup>
              <CFormGroup>
                <CLabel htmlFor="nf-password">Short Description</CLabel>
                <CTextarea
                  name="shortDescription"
                  placeholder="Enter Short Description."
                  onChange = { onChange }
                  value = { formData.shortDescription }
                  rows = "2"
                />
                  {error.shortDescription &&  <Alert message="Short Description is required" type="error" />  }
                <CFormText className="help-block">Please enter Short Description</CFormText>
              </CFormGroup>
              <CFormGroup>
                <CLabel htmlFor="nf-password">Long Description</CLabel>
                <CTextarea
                  name="longDescription"
                  placeholder="Enter Long Description."
                  onChange = { onChange }
                  value = {formData.longDescription}
                  size = "large"
                  rows = "5"
                  cols = "40"
                />
                 {error.longDescription &&  <Alert message="Long Description is required" type="error" />  }
                <CFormText className="help-block">Please enter Long Description</CFormText>
              </CFormGroup>
              <CFormGroup>
                <CLabel >Category</CLabel>
                <select 
                  onChange = {onChange}
                  name = "category" 
                  style = {{ marginLeft: 20, width: '30%', padding: 5, border: '1px solid black', borderRadius: 10 }}
                  value = {!_.isEmpty(formData) &&formData.category}  
                >
                  { allCateogories.map((category)=>{
                      if(category.type === "main_category"){
                        return(
                          <option value = {category._id}>{ category.title }</option>
                        );
                      }  
                    })
                  }
                </select>
                {error.category &&  <Alert message="Select Atleast one category" type="error" />  }
                <CFormText className="help-block">Please Select Category</CFormText>
              </CFormGroup>
              { isBar &&
                (<CFormGroup>
                  <CLabel >Bar Category</CLabel>
                  <select 
                    onChange = { onChange } 
                    name = "barCategory"
                    style = {{ marginLeft: 20, width: '30%', padding: 5, border: '1px solid black', borderRadius: 10 }}
                    value = { !_.isEmpty(formData) && formData.barCategory &&formData.barCategory } 
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
                  {error.barCategory &&  <Alert message="Select Atleast one category" type="error" />  }
                  <CFormText className="help-block">Please Select Bar Category</CFormText>
                </CFormGroup>)
              }
              <CFormGroup>
                <CLabel >AgeInterval</CLabel>
                <select 
                  onChange = {onChange } 
                  name = "ageInterval"
                  style = {{ marginLeft: 20, width: '30%', padding: 5, border: '1px solid black', borderRadius: 10 }} 
                >
                  <option selected value="young">21-25</option>
                  <option value="elder">26-40</option>
                  <option value="all">All</option>
                </select>
                {error.ageInterval &&  <Alert message="Your Age is required be to Select" type="error" />  }
                <CFormText className="help-block">Please Select Age</CFormText>
              </CFormGroup>
              <p style = {{ fontSize: 20 }} >Rating:</p>
              <CFormGroup>
                <CLabel style = {{ fontSize: 20 }} > Fun :</CLabel>
                <span style = {{ position: 'relative', top: 5, left: 20 }} >
                  <Rating name="fun" value={ratingData.fun} onChange = { onChangeRating } size="large" precision = {0.1} max = {10} />
                </span>  
                <span style = {{ marginLeft: 30, fontSize: 20 }} > { ratingData.fun } </span>
                <hr />

                <CLabel style = {{ fontSize: 20 }} > Crowd :</CLabel>
                <span style = {{ position: 'relative', top: 5, left: 20 }} >
                  <Rating name="crowd" value={ratingData.crowd} onChange = {onChangeRating } size="large" precision = {0.1} max = {10} />
                </span>  
                <span style = {{ marginLeft: 30, fontSize: 20 }} >{ ratingData.crowd }</span>
                <hr />

                <CLabel style = {{ fontSize: 20 }} > girlToGuyRatio :</CLabel>
                <span style = {{ position: 'relative', top: 5, left: 20 }} >
                  <Rating name="girlToGuyRatio" value={ratingData.girlToGuyRatio} onChange = {onChangeRating} size="large" precision = {0.1} max = {10} />
                </span>  
                <span style = {{ marginLeft: 30, fontSize: 20 }} >{ ratingData.girlToGuyRatio }</span>
                <hr />

                <CLabel style = {{ fontSize: 20 }} > difficultyGettingIn :</CLabel>
                <span style = {{ position: 'relative', top: 5, left: 20 }} >
                  <Rating name = "difficultyGettingIn" value={ratingData.difficultyGettingIn} onChange = {onChangeRating} size="large" precision = {0.1} max = {10} />
                </span>  
                <span style = {{ marginLeft: 30, fontSize: 20 }} >{ ratingData.difficultyGettingIn }</span>
                <hr />

                <CLabel style = {{ fontSize: 20 }} > difficultyGettingDrink :</CLabel>
                <span style = {{ position: 'relative', top: 5, left: 20 }} >
                  <Rating name = "difficultyGettingDrink" value = {ratingData.difficultyGettingDrink} onChange = {onChangeRating} size="large" precision = {0.1} max = {10} />
                </span>  
                <span style = {{ marginLeft: 10, fontSize: 20 }} > { ratingData.difficultyGettingDrink } </span>   
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
            ADD Restaurant
          </CButton>
          {/* <input type = "submit" />    */}
          </CCol>
        </CRow>
      </CContainer>    
    </div>
  );
}