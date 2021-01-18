import {
 CRow,
 CCol,
 CContainer
} from '@coreui/react'
import Card from './BusinessCard'

export default (props) => {
  const { businesses } = props;

  return(
    <div>
      <CContainer>
        <CRow style = {{ marginTop: 10 }} >
          { businesses.length>0 && businesses.map((business)=>{      
            return(
              business ?
              <CCol xs="12" sm = "6" lg = "4" >
                <Card 
                  addCategorizeBusiness = {props.addCategorizeBusiness} 
                  history = {props.history} 
                  category = {props.category} 
                  showLink = {true} 
                  business = {business} 
                  update = { props.update } 
                />
              </CCol>: null
            );           
            })
          } 
        </CRow>
      </CContainer>
    </div>
  )
}