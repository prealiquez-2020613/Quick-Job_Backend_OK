import User from '../src/user/user.model.js'
import Category from '../src/category/category.model.js'


export const findUser = async (id)=>{
    try {
        const userExist = await User.findById(id)
        if (!userExist) return false
        return userExist
    } catch (error) {
        console.error(error)
        return false
    }
};

export const existEmail = async(email)=>{
    const alreadyEmail = await User.findOne({email});
    if(alreadyEmail){
        console.error(`Email ${email} already exist`);
        throw new error(`Email ${email} already exist`);
    }
};

export const existUsername = async(username)=>{
    const alreadyUsername = await User.findOne({username});
    if(alreadyUsername){
        console.error(`Username ${username} already exist`);
        throw new error(`Username ${username} already exist`);
    }
};

// Validador para verificar si el nombre de categoría ya existe
export const categoryNameExists = async (name, { req }) => {
    const existingCategory = await Category.findOne({ name: name.trim() })
    

    if (req.method === 'PUT' && req.params?.id) {
        if (existingCategory && existingCategory._id.toString() !== req.params.id) {
            throw new Error('Category name already exists')
        }
    } else if (existingCategory) {

        throw new Error('Category name already exists')
    }
    
    return true
}