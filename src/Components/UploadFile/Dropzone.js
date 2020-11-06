import React, {useCallback} from 'react'
import {useDropzone} from 'react-dropzone'
import Typography from '@material-ui/core/Typography'
import Button from '@material-ui/core/Button'

const style = {
	flex: 1,
	display: 'flex',
	justifyContent: 'center',
	flexDirection: 'column',
	height: '300px',
	alignItems: 'center',
	paddingTop: '30px',
	paddingBottom: '30px',
	paddingLeft: 'auto',
	paddingRight: 'auto',
	// borderWidth: 3,
	// borderRadius: 2,
	// borderColor: '#000000',
	// borderStyle: 'dashed',
	background: "repeating-linear-gradient(45deg, rgba(189, 189, 189, 0.3), rgba(189, 189, 189, 0.3) 10px, rgba(255, 255, 255, 0.3) 10px, rgba(255, 255, 255, 0.3) 25px)",
	opacity: 'rgba(76, 175, 80, 0.1)',
	color: 'black',
	outline: 'none',
	transition: 'border .24s ease-in-out',
  };
  

const Dropzone = (props) => {
	const onDrop = useCallback((acceptedFiles) => {
	  acceptedFiles.forEach((file) => {
		props.handleChange(file)
		props.handleClick()
		let reader = new FileReader();
		reader.onloadend = () => {
			props.setImage(reader.result)
		}
		reader.readAsDataURL(file)
	  })
	}, [])
	
	const {
		acceptedFiles, 
		getRootProps, 
		getInputProps, 
		open, 
	} = useDropzone({
		onDrop, 
		noClick: true,
		noKeyboard: true,
		multiple: true
	})

	// const files = acceptedFiles.map(file => (
	// 	<li key={file.name}>
	// 		{file.name} - {file.size} bytes
	// 	</li>
	// ));
	
	// console.log(files)
  
	return (
	<section className="container" style={{width: 300 }}>
	  <div {...getRootProps({style})}>
		<input {...getInputProps()} />
		<Typography variant="h6">Перетащите фото с одним лицом сюда или нажмите для выбора файла.</Typography>
		<Button variant="outlined" style={{background: 'white', borderWidth: 2, borderColor: 'black'}} onClick={open}>
          Выбрать файл
        </Button>
	  </div>
	</section>
	)
  }

export default Dropzone