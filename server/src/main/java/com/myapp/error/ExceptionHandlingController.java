package com.myapp.error;

//import org.slf4j.Logger;
//import org.slf4j.LoggerFactory;
//import org.springframework.http.HttpStatus;
//import org.springframework.http.ResponseEntity;
//import org.springframework.web.bind.annotation.ControllerAdvice;
//import org.springframework.web.bind.annotation.ExceptionHandler;
//import org.springframework.web.bind.annotation.ResponseStatus;
//
//import com.myapp.controller.DatController;
//
//
//@ControllerAdvice
//public class ExceptionHandlingController{
//	private static final Logger logger = LoggerFactory.getLogger(ExceptionHandlingController.class);
//	@ExceptionHandler(value = RuntimeException.class)
//    public ResponseEntity<RestError> errorHandling(RuntimeException e) {
//		RestError err = new RestError();
//		err.setMessage(e.getMessage());
//		return new ResponseEntity<RestError>()
//    	
//    }
//}
