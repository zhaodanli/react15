import { useState } from 'react';
function useForm(values) {
    const [formData, setFormData] = useState(values);
    const setFormValue = (key, value) => {
        setFormData({...formData,[key]:value});
    }
    const resetFormValues = () => {
        setFormData(values);
    }
    return [formData, setFormValue, resetFormValues];
}

export default useForm;