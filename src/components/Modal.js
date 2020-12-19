import { useState, useEffect } from 'react';
import {
  CButton,
  CModal,
  CModalHeader,
  CModalBody,
  CModalFooter,
 } from '@coreui/react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useHistory } from 'react-router-dom';

export default (props) => {
const history = useHistory();

const [modal, setModal] = useState(false);

  const toggle = ()=>{
    setModal(!modal);
  }
 
  return(
    <div>
      <CModal
        show={props.showPopup}
        onClose={toggle}
      >
        <CModalHeader 
          closeButton
        > 
        { props.success ?
         (<div> <span> Successfull </span> 
          <i style = {{ fontSize: 20, color: 'green', marginLeft: 5 }} className="fas fa-check-circle"></i></div>) 
          :  (<div> <span> Error </span> 
            <i style = {{ fontSize: 20, color: 'red', marginLeft: 5 }} className="fas fa-calendar-times"></i></div>) 
        }
        </CModalHeader>
        <CModalBody>
          <span style = {{ textAlign: 'center', fontSize: 20, fontWeight: 500 }} >{props.message}</span> 
        </CModalBody>
        <CModalFooter>
          <CButton color="success" onClick = {()=> {  
            if(props.notRedirect){
              props.closeModal()
            }
            else{
              props.delete ? history.push('/') :history.push('/business')  
            }
          }} >Ok</CButton>
        </CModalFooter>
      </CModal>
    </div>
  );
}