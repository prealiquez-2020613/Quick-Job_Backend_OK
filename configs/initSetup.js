import User from '../src/user/user.model.js';
import Category from '../src/category/category.model.js';
import { encrypt } from '../utils/encrypt.js';

export const initializeDatabase = async () => {
    try {

        const adminExists = await User.findOne({ role: process.env.ADMIN_ROLE });

        if (!adminExists) {
            const hashedPassword = await encrypt(process.env.ADMIN_PASSWORD);

            const adminUser = new User({
                name: process.env.ADMIN_NAME,
                surname : process.env.ADMIN_SURNAME,
                username : process.env.ADMIN_USERNAME,
                email: process.env.ADMIN_EMAIL,
                password: hashedPassword,
                phone : process.env.ADMIN_PHONE,
                role: process.env.ADMIN_ROLE,
                location: process.env.ADMIN_LOCATION
            });

            await adminUser.save();
            console.log('Admin user created succesfully');
        } else {
            console.log('Admin user already exist');
        }

        const defaultCategoryExists = await Category.findOne({ name: process.env.CATEGORY_NAME });

        if (!defaultCategoryExists) {
            const defaultCategory = new Category({
                name: process.env.CATEGORY_NAME,
                description: process.env.CATEGORY_DESCRIPTION
            }); 

            await defaultCategory.save();
            console.log('Default category created succesfully');
        } else {
            console.log('Default category already exist');
        }

        console.log('Initialization succesfully');
    } catch (error) {
        console.error('General Error', error);
    }
};
