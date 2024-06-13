import Joi from "joi";

const validateRequest = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body);
    if (error) {
      return res.status(400).json({
        message: error.details[0].message,
      });
    }
    if (!req.value) {
      req.value = {}; // create an empty object the request value doesn't exist yet
    }
    req.value["body"] = req.body;
    next();
  };
};

const schemas = {
  authSchema: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
    phone: Joi.string().min(10).max(10).required(),
  }),
};
const signupSchemas = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  userName: Joi.string().min(3).max(10).required(),
  phoneNumber: Joi.string().min(10).max(11).required(),
});
const loginSchemas = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
});

export { validateRequest, schemas, signupSchemas, loginSchemas };
