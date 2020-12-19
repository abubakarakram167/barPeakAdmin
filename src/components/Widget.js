import React from 'react';

class CloudinaryWidget extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      showWidget: false,
      url: null
    }
  }

  showWidget = () => {
    this.setState({ showWidget: true },()=>{
      if(this.state.showWidget){
        console.log("opeinigngg")
        let widget = window.cloudinary.openUploadWidget({
          cloudName: "developer-inn",
          uploadPreset: "obid55oq"},
          (error, result) => {this.checkUploadResult(result)
        });
      }
    })

  }


  checkUploadResult = (resultEvent) => {
    if(resultEvent.event === 'success'){
      console.log("the url", resultEvent)
      this.setState({ url: resultEvent.info.url, showImage: false })
      this.props.showImage(resultEvent.info)
      // this.setState({ imageShow: true })
    }
  }

  render() {
    return (
      <div>
        <div id = "photo-form-container" style = {{ textAlign:'center', marginTop: 30 }}>
          <button style = {{ position: 'absolute', top: '45%', left: '24%', borderRadius: '10%' }} className = "widget-button"  onClick = { () => this.showWidget() }  > { !this.state.url ?' Upload' : 'Change'  } </button>
        </div>
      </div> 
    );
  }
}

export default CloudinaryWidget;