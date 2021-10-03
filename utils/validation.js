const userValidation = {
    firstName: {
    value: '', 
    name:"שם פרטי",
    inValid:false,
    appropriateError:"אותיות בלבד",
    errors: [], 
    validations: {
        required: true, 
        pattern: /^[a-z \u0590-\u05fe]+$/i
    }
    }, 
    lastName: {
        value: '',
        name:"שם משפחה",
        inValid:false,
        appropriateError:"אותיות בלבד",
        errors:[], 
        validations:{
            required: true, 
            pattern: /^[a-z \u0590-\u05fe]+$/i
        }
    },
    email: {
        value: '',
        name:"דואר אלקטרוני",
        inValid:false,
        appropriateError:"לא תקין", 
        errors:[], 
        validations:{
            required: true, 
            pattern: /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/ 
        }
    },
    password: {
        value: '',
        name:"סיסמא",
        inValid:false,
        appropriateError:"לפחות 6 תווים עם אות (אנגלית) וספרה",
        errors:[], 
        validations:{
            required: true, 
            pattern: /^(?=.*[a-z])(?=.*[0-9])(?=.{6,})/ 
        }
    },confirmPassword: {
        value: '',
        name:"אימות סיסמא",
        inValid:false,
        appropriateError:"לפחות 6 תווים עם אות וספרה",
        errors:[], 
        validations:{
            required: true, 
            pattern: /^(?=.*[a-z])(?=.*[0-9])(?=.{6,})/  
        }
    }
}

const loginValidation = {
    email: {
        value: '',
        name:"דואר אלקטרוני",
        inValid:false,
        appropriateError:"לא תקין", 
        errors:[], 
        validations:{
            required: true, 
            pattern: /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/ 
            }
    },
    password: {
        value: '',
        name:"סיסמא",
        inValid:false, 
        appropriateError:"לפחות 6 תווים עם אות (אנגלית) וספרה",
        errors:[], 
        validations:{
            required: true, 
            pattern: /^(?=.*[a-z])(?=.*[0-9])(?=.{6,})/ 
        }
    }
}

const recommendationValidation = {
    text: {
        value: '',
        name:"טקסט",
        inValid:false,
        appropriateError:"לפחות 10 תווים חוקיים",
        errors:[], 
        validations:{
            required: true,  
            pattern: /^[!-+:/,.? ^+-=0-9\a-z\u0590-\u05fe]{10,}$/i   
        }
    }
}

const addressValidation = {
    address: {
        value: '',
        name:"כתובת",
        inValid:false,
        appropriateError:"",
        errors:[], 
        validations:{
            required: true, 
            pattern: false 
        }
    },
    zip: {
        value: '',
        name:"מיקוד",
        inValid:false,
        appropriateError:"",
        errors:[], 
        validations:{
            required: true, 
            pattern: /^[0-9]*$/
        }
    },
    phone: {
        value: '',
        name:"טלפון",
        inValid:false,
        appropriateError:"ספרות בלבד ",
        errors:[], 
        validations:{
            required: true, 
            pattern: /[0-9]$/ 
        }
    }
    
}


const contactUsValidation = {
    firstName: {
        value: '', 
        name:"שם פרטי",
        inValid:false,
        appropriateError:"אותיות בלבד",
        errors: [], 
        validations: {
            required: true, 
            pattern: /^[a-z \u0590-\u05fe]+$/i
        }
    }, 
    lastName: {
        value: '',
        name:"שם משפחה",
        inValid:false,
        appropriateError:"אותיות בלבד",
        errors:[], 
        validations:{
            required: true, 
            pattern: /^[a-z \u0590-\u05fe]+$/i
        }
    },
    email: {
        value: '',
        name:"דואר אלקטרוני",
        inValid:false,
        appropriateError:"לא תקין", 
        errors:[], 
        validations:{
            required: true, 
            pattern: /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/ 
            }
    },
    phone: {
        value: '',
        name:"טלפון",
        inValid:false,
        appropriateError:"ספרות בלבד ",
        errors:[], 
        validations:{
            required: true, 
            pattern: /[0-9]$/ 
        }
    },
    subject: {
        value: '',
        name:"נושא פנייה",
        inValid:false,
        appropriateError:false,
        errors:[], 
        validations:{
            required: true, 
            pattern: false
        }
    },
    text: {
        value: '',
        name:"טקסט",
        inValid:false,
        appropriateError:"לפחות 10 תווים חוקיים",
        errors:[], 
        validations:{
            required: true, 
            pattern:   /^[!-+:/,.? ^+-=0-9\a-z\u0590-\u05fe]{10,}$/i 
        }
    }
}

function validation(value,name,inputsDetails){
    const newErrors = []
    let inValid = false
    const {validations} = inputsDetails[name]
    
    if(validations.required && !value){
      newErrors.push(`נדרש - ${inputsDetails[name].name}`)
      inValid = true
    }

    if(validations.pattern && !validations.pattern.test(value)){
          newErrors.push(`${inputsDetails[name].name} - ${inputsDetails[name].appropriateError}`)
          inValid = true
    }

    if(name==="confirmPassword" && inputsDetails["password"].value !== value){
        newErrors.push("אין התאמה לסיסמא שנבחרה")
        inValid = true
    }
    
    inputsDetails[name].inValid = inValid
    inputsDetails[name].value = value
    inputsDetails[name].errors = newErrors

   return inValid

}

module.exports = {validation, userValidation, loginValidation, recommendationValidation, addressValidation, contactUsValidation}