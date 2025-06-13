import React from 'react';
import useForm from './../hooks/useForm';

export default function Form() {
    const [formData, setFormValue, resetFormValues] = useForm({username:'',email:''});

    return (
        <div className="panel">
            <div className="panel-body">
                <form>
                    <div className="form-group">
                        <label >用户名</label>
                        <input
                            className="form-control"
                            placeholder="用户名"
                            value={formData.username}
                            onChange={(event) => setFormValue('username', event.target.value)} />
                    </div>
                    <div className="form-group">
                        <label >邮箱</label>
                        <input
                            className="form-control"
                            placeholder="邮箱"
                            value={formData.email}
                            onChange={(event) => setFormValue('email', event.target.value)}
                        />
                    </div>
                    <button type="button" className="btn btn-default" onClick={() => console.log(formData)}>提交</button>
                    <button  type="button" className="btn btn-default" onClick={resetFormValues}>重置</button>
                </form>
            </div>
        </div>
    )
}