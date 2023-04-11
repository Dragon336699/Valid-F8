// Đối tượng validator
function Validator(options) {
    var selectorRules = {}
    function validate(inputElement, rule) {
        var rules = selectorRules[rule.selector]
        var errorMessage;
        var errorElement = inputElement.closest(options.formGroupSelector).querySelector(options.errorSelector)
        for (var i = 0; i < rules.length; i++) {
            switch(inputElement.type){
                case 'radio':
                case 'checkbox':
                    errorMessage = rules[i]
                default: errorMessage = rules[i](inputElement.value)
            }
            if (errorMessage) break;
        }
        if (errorMessage) {
            errorElement.innerHTML = errorMessage
            inputElement.parentElement.classList.add('invalid')
        }
        else {
            errorElement.innerHTML = ""
            inputElement.parentElement.classList.remove('invalid')
        }
        return !errorMessage
    }
    var formElement = document.querySelector(options.form)
    if (formElement) {
        formElement.onsubmit = function (e) {
            e.preventDefault()
            var isFormValid = true;
            options.rules.forEach(function (rule) {
                var inputElement = formElement.querySelector(rule.selector)
                var isValid = validate(inputElement, rule)
                if (!isValid) {
                    isFormValid = false;
                }
            })
            if (isFormValid) {
                if (typeof options.onSubmit == 'function'){
                    var enableInputs = formElement.querySelectorAll('[name]')
                    var formValues = Array.from(enableInputs).reduce(function (values, input) {
                        values[input.name] = input.value
                        return values
                    }, {})
                    options.onSubmit(formValues)
                }
                else {
                    formElement.submit()
                }

            }
        }
        options.rules.forEach(function (rule) {
            // Lưu lại các rule cho mỗi input
            if (Array.isArray(selectorRules[rule.selector])) {
                selectorRules[rule.selector].push(rule.test)
            }
            else {
                selectorRules[rule.selector] = [rule.test]
            }

            var inputElement = formElement.querySelector(rule.selector)
            if (inputElement) {
                // Xử lý khi blur khỏi input
                inputElement.onblur = function () {
                    validate(inputElement, rule)
                }
                // Xử lý khi người dùng nhập input
                inputElement.oninput = function () {
                    var errorElement = inputElement.closest(options.formGroupSelector).querySelector(options.errorSelector)
                    errorElement.innerHTML = ""
                    inputElement.parentElement.classList.remove('invalid')
                }
            }
        })
    }
}
// Định nghĩa rules
Validator.isRequired = function (selector) {
    return {
        selector: selector,
        test: function (value) {
            return value.trim() ? undefined : 'Vui lòng nhập trường này'
        }
    }
}

Validator.isEmail = function (selector) {
    return {
        selector: selector,
        test: function (value) {
            var regex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
            return regex.test(value) ? undefined : "Trường này phải là email"
        }
    }
}

Validator.checkPass = function (selector, min) {
    return {
        selector: selector,
        test: function (value) {
            return value.length >= 6 ? undefined : `Vui lòng nhập tối thiểu ${min} kí tự`
        }
    }
}

Validator.isConfirmed = function (selector, getConfirm, massage) {
    return {
        selector: selector,
        test: function (value) {
            return value === getConfirm() ? undefined : massage || "Giá trị nhập lại không chính xác"
        }
    }
}