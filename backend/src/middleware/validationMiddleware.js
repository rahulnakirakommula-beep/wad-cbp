const { z, ZodError } = require('zod');

const validate = (schema) => (req, res, next) => {
  try {
    schema.parse({
      body: req.body,
      query: req.query,
      params: req.params,
    });
    next();
  } catch (err) {
    if (err instanceof ZodError) {
      res.status(400);
      return res.json({
        message: 'Validation Error',
        errors: err.issues.map(e => ({ path: e.path.join('.'), message: e.message }))
      });
    }
    next(err);
  }
};

// Auth Schemas
const signupSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Name is too short'),
    email: z.string().email('Invalid email address'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
  })
});

const loginSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(1, 'Password is required'),
  })
});

// Listing Schema
const listingSchema = z.object({
  body: z.object({
    orgName: z.string().min(1),
    title: z.string().min(1),
    type: z.enum(['internship', 'job', 'research', 'fellowship', 'hackathon', 'competition', 'scholarship', 'mentorship', 'workshop', 'incubator', 'other']),
    externalUrl: z.string().url(),
  }).passthrough() // Allow other fields for now
});

module.exports = {
  validate,
  signupSchema,
  loginSchema,
  listingSchema
};
