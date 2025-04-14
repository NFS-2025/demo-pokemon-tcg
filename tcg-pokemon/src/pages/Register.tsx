import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useAuth } from '../context/AuthContext';
import { User, Lock, Mail, Phone, Calendar, MapPin, CheckCircle, AlertCircle } from 'lucide-react';

// Schéma de validation Yup
const registerSchema = yup.object().shape({
  username: yup.string()
    .required('Le nom d\'utilisateur est obligatoire')
    .min(3, 'Le nom d\'utilisateur doit comporter au moins 3 caractères')
    .max(20, 'Le nom d\'utilisateur ne peut pas dépasser 20 caractères'),
  
  email: yup.string()
    .required('L\'email est obligatoire')
    .email('Format d\'email invalide'),
  
  password: yup.string()
    .required('Le mot de passe est obligatoire')
    .min(8, 'Le mot de passe doit comporter au moins 8 caractères')
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
      'Le mot de passe doit contenir au moins une majuscule, une minuscule, un chiffre et un caractère spécial'
    ),
  
  confirmPassword: yup.string()
    .required('La confirmation du mot de passe est obligatoire')
    .oneOf([yup.ref('password')], 'Les mots de passe doivent correspondre'),
  
  firstName: yup.string()
    .required('Le prénom est obligatoire')
    .min(2, 'Le prénom doit comporter au moins 2 caractères'),
  
  lastName: yup.string()
    .required('Le nom de famille est obligatoire')
    .min(2, 'Le nom de famille doit comporter au moins 2 caractères'),
  
  phoneNumber: yup.string()
    .matches(/^(\+\d{1,3}[- ]?)?\d{10}$/, 'Numéro de téléphone invalide (format: +33612345678 ou 0612345678)'),
  
  dateOfBirth: yup.date()
    .max(new Date(), 'La date de naissance ne peut pas être dans le futur')
    .test('is-adult', 'Vous devez avoir au moins 13 ans pour vous inscrire', function(value) {
      if (!value) return true; // Si aucune valeur, d'autres validateurs s'en occuperont
      const cutoff = new Date();
      cutoff.setFullYear(cutoff.getFullYear() - 13);
      return value <= cutoff;
    }),
  
  address: yup.string()
    .min(5, 'L\'adresse doit comporter au moins 5 caractères'),
  
  city: yup.string()
    .min(2, 'La ville doit comporter au moins 2 caractères'),
  
  zipCode: yup.string()
    .matches(/^\d{5}$/, 'Le code postal doit contenir 5 chiffres'),
  
  termsAccepted: yup.boolean()
    .required('Vous devez accepter les conditions d\'utilisation')
    .oneOf([true], 'Vous devez accepter les conditions d\'utilisation')
});

// Type des données du formulaire
type RegisterFormData = yup.InferType<typeof registerSchema>;

export function Register() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  
  const { 
    register, 
    handleSubmit, 
    formState: { errors },
    watch 
  } = useForm<RegisterFormData>({
    resolver: yupResolver(registerSchema),
    mode: 'onBlur' // Valider lors de la perte du focus
  });

  // Pour afficher la complexité du mot de passe en temps réel
  const password = watch('password', '');
  const getPasswordStrength = (pass: string) => {
    if (!pass) return { strength: 0, label: '', color: '' };
    
    let strength = 0;
    if (pass.length >= 8) strength += 1;
    if (/[A-Z]/.test(pass)) strength += 1;
    if (/[a-z]/.test(pass)) strength += 1;
    if (/\d/.test(pass)) strength += 1;
    if (/[@$!%*?&]/.test(pass)) strength += 1;
    
    const labels = ['Très faible', 'Faible', 'Moyen', 'Fort', 'Très fort'];
    const colors = ['bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-blue-500', 'bg-green-500'];
    
    return {
      strength,
      label: labels[strength - 1] || '',
      color: colors[strength - 1] || ''
    };
  };
  
  const passwordStrength = getPasswordStrength(password);

  const onSubmit = async (data: RegisterFormData) => {
    setIsSubmitting(true);
    setSubmitError(null);
    setSubmitSuccess(false);
    
    try {
      // Simulation d'un appel à l'API backend
      console.log('Données d\'inscription envoyées:', data);
      
      // Simule un délai d'attente de 1.5 secondes
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Simulation d'une réponse réussie
      setSubmitSuccess(true);
      
      // Redirection vers la page d'accueil après 2 secondes
      setTimeout(() => {
        login(data.username);
        navigate('/');
      }, 2000);
      
    } catch (error) {
      console.error('Erreur lors de l\'inscription:', error);
      setSubmitError('Une erreur est survenue lors de l\'inscription. Veuillez réessayer.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto bg-white p-8 rounded-lg shadow-lg">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Créez votre compte Pokémon TCG</h1>
          <p className="mt-2 text-gray-600">
            Rejoignez notre communauté et commencez à construire votre collection
          </p>
        </div>
        
        {submitSuccess ? (
          <div className="bg-green-50 p-4 rounded-md mb-6 flex items-center">
            <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
            <div>
              <h3 className="text-green-800 font-medium">Inscription réussie!</h3>
              <p className="text-green-700 mt-1">Votre compte a été créé avec succès. Vous allez être redirigé vers la page d'accueil...</p>
            </div>
          </div>
        ) : submitError ? (
          <div className="bg-red-50 p-4 rounded-md mb-6 flex items-center">
            <AlertCircle className="h-5 w-5 text-red-500 mr-3" />
            <div>
              <h3 className="text-red-800 font-medium">Erreur</h3>
              <p className="text-red-700 mt-1">{submitError}</p>
            </div>
          </div>
        ) : null}
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Informations de compte */}
            <div className="space-y-4 col-span-1 md:col-span-2">
              <h2 className="text-xl font-semibold text-gray-800 border-b pb-2">Informations de compte</h2>
              
              <div className="relative">
                <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
                  Nom d'utilisateur*
                </label>
                <div className="flex">
                  <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500">
                    <User className="h-5 w-5" />
                  </span>
                  <input
                    type="text"
                    id="username"
                    {...register('username')}
                    className={`block w-full rounded-r-md focus:outline-none sm:text-sm ${
                      errors.username ? 'border-red-300 text-red-900 placeholder-red-300 focus:border-red-500 focus:ring-red-500' 
                      : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                    }`}
                    placeholder="johndoe"
                  />
                </div>
                {errors.username && (
                  <p className="mt-2 text-sm text-red-600">{errors.username.message}</p>
                )}
              </div>
              
              <div className="relative">
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Adresse email*
                </label>
                <div className="flex">
                  <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500">
                    <Mail className="h-5 w-5" />
                  </span>
                  <input
                    type="email"
                    id="email"
                    {...register('email')}
                    className={`block w-full rounded-r-md focus:outline-none sm:text-sm ${
                      errors.email ? 'border-red-300 text-red-900 placeholder-red-300 focus:border-red-500 focus:ring-red-500' 
                      : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                    }`}
                    placeholder="john.doe@example.com"
                  />
                </div>
                {errors.email && (
                  <p className="mt-2 text-sm text-red-600">{errors.email.message}</p>
                )}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="relative">
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                    Mot de passe*
                  </label>
                  <div className="flex">
                    <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500">
                      <Lock className="h-5 w-5" />
                    </span>
                    <input
                      type="password"
                      id="password"
                      {...register('password')}
                      className={`block w-full rounded-r-md focus:outline-none sm:text-sm ${
                        errors.password ? 'border-red-300 text-red-900 placeholder-red-300 focus:border-red-500 focus:ring-red-500' 
                        : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                      }`}
                      placeholder="••••••••"
                    />
                  </div>
                  {password && (
                    <div className="mt-2">
                      <div className="flex items-center">
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full ${passwordStrength.color}`} 
                            style={{ width: `${(passwordStrength.strength / 5) * 100}%` }}
                          ></div>
                        </div>
                        <span className="ml-2 text-xs text-gray-500">{passwordStrength.label}</span>
                      </div>
                    </div>
                  )}
                  {errors.password && (
                    <p className="mt-2 text-sm text-red-600">{errors.password.message}</p>
                  )}
                </div>
                
                <div className="relative">
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                    Confirmer le mot de passe*
                  </label>
                  <div className="flex">
                    <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500">
                      <Lock className="h-5 w-5" />
                    </span>
                    <input
                      type="password"
                      id="confirmPassword"
                      {...register('confirmPassword')}
                      className={`block w-full rounded-r-md focus:outline-none sm:text-sm ${
                        errors.confirmPassword ? 'border-red-300 text-red-900 placeholder-red-300 focus:border-red-500 focus:ring-red-500' 
                        : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                      }`}
                      placeholder="••••••••"
                    />
                  </div>
                  {errors.confirmPassword && (
                    <p className="mt-2 text-sm text-red-600">{errors.confirmPassword.message}</p>
                  )}
                </div>
              </div>
            </div>
            
            {/* Informations personnelles */}
            <div className="space-y-4 col-span-1 md:col-span-2">
              <h2 className="text-xl font-semibold text-gray-800 border-b pb-2">Informations personnelles</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="relative">
                  <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
                    Prénom*
                  </label>
                  <input
                    type="text"
                    id="firstName"
                    {...register('firstName')}
                    className={`block w-full rounded-md focus:outline-none sm:text-sm ${
                      errors.firstName ? 'border-red-300 text-red-900 placeholder-red-300 focus:border-red-500 focus:ring-red-500' 
                      : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                    }`}
                    placeholder="John"
                  />
                  {errors.firstName && (
                    <p className="mt-2 text-sm text-red-600">{errors.firstName.message}</p>
                  )}
                </div>
                
                <div className="relative">
                  <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
                    Nom*
                  </label>
                  <input
                    type="text"
                    id="lastName"
                    {...register('lastName')}
                    className={`block w-full rounded-md focus:outline-none sm:text-sm ${
                      errors.lastName ? 'border-red-300 text-red-900 placeholder-red-300 focus:border-red-500 focus:ring-red-500' 
                      : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                    }`}
                    placeholder="Doe"
                  />
                  {errors.lastName && (
                    <p className="mt-2 text-sm text-red-600">{errors.lastName.message}</p>
                  )}
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="relative">
                  <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 mb-1">
                    Numéro de téléphone
                  </label>
                  <div className="flex">
                    <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500">
                      <Phone className="h-5 w-5" />
                    </span>
                    <input
                      type="tel"
                      id="phoneNumber"
                      {...register('phoneNumber')}
                      className={`block w-full rounded-r-md focus:outline-none sm:text-sm ${
                        errors.phoneNumber ? 'border-red-300 text-red-900 placeholder-red-300 focus:border-red-500 focus:ring-red-500' 
                        : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                      }`}
                      placeholder="0612345678"
                    />
                  </div>
                  {errors.phoneNumber && (
                    <p className="mt-2 text-sm text-red-600">{errors.phoneNumber.message}</p>
                  )}
                </div>
                
                <div className="relative">
                  <label htmlFor="dateOfBirth" className="block text-sm font-medium text-gray-700 mb-1">
                    Date de naissance
                  </label>
                  <div className="flex">
                    <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500">
                      <Calendar className="h-5 w-5" />
                    </span>
                    <input
                      type="date"
                      id="dateOfBirth"
                      {...register('dateOfBirth')}
                      className={`block w-full rounded-r-md focus:outline-none sm:text-sm ${
                        errors.dateOfBirth ? 'border-red-300 text-red-900 placeholder-red-300 focus:border-red-500 focus:ring-red-500' 
                        : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                      }`}
                    />
                  </div>
                  {errors.dateOfBirth && (
                    <p className="mt-2 text-sm text-red-600">{errors.dateOfBirth.message}</p>
                  )}
                </div>
              </div>
            </div>
            
            {/* Adresse */}
            <div className="space-y-4 col-span-1 md:col-span-2">
              <h2 className="text-xl font-semibold text-gray-800 border-b pb-2">Adresse</h2>
              
              <div className="relative">
                <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                  Adresse
                </label>
                <div className="flex">
                  <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500">
                    <MapPin className="h-5 w-5" />
                  </span>
                  <input
                    type="text"
                    id="address"
                    {...register('address')}
                    className={`block w-full rounded-r-md focus:outline-none sm:text-sm ${
                      errors.address ? 'border-red-300 text-red-900 placeholder-red-300 focus:border-red-500 focus:ring-red-500' 
                      : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                    }`}
                    placeholder="123 Rue de la Paix"
                  />
                </div>
                {errors.address && (
                  <p className="mt-2 text-sm text-red-600">{errors.address.message}</p>
                )}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="relative">
                  <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
                    Ville
                  </label>
                  <input
                    type="text"
                    id="city"
                    {...register('city')}
                    className={`block w-full rounded-md focus:outline-none sm:text-sm ${
                      errors.city ? 'border-red-300 text-red-900 placeholder-red-300 focus:border-red-500 focus:ring-red-500' 
                      : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                    }`}
                    placeholder="Paris"
                  />
                  {errors.city && (
                    <p className="mt-2 text-sm text-red-600">{errors.city.message}</p>
                  )}
                </div>
                
                <div className="relative">
                  <label htmlFor="zipCode" className="block text-sm font-medium text-gray-700 mb-1">
                    Code postal
                  </label>
                  <input
                    type="text"
                    id="zipCode"
                    {...register('zipCode')}
                    className={`block w-full rounded-md focus:outline-none sm:text-sm ${
                      errors.zipCode ? 'border-red-300 text-red-900 placeholder-red-300 focus:border-red-500 focus:ring-red-500' 
                      : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                    }`}
                    placeholder="75000"
                  />
                  {errors.zipCode && (
                    <p className="mt-2 text-sm text-red-600">{errors.zipCode.message}</p>
                  )}
                </div>
              </div>
            </div>
          </div>
          
          {/* Conditions d'utilisation */}
          <div className="relative flex items-start">
            <div className="flex items-center h-5">
              <input
                id="termsAccepted"
                type="checkbox"
                {...register('termsAccepted')}
                className={`h-4 w-4 rounded ${
                  errors.termsAccepted ? 'border-red-300 text-red-600 focus:ring-red-500' : 'border-gray-300 text-blue-600 focus:ring-blue-500'
                }`}
              />
            </div>
            <div className="ml-3 text-sm">
              <label htmlFor="termsAccepted" className="font-medium text-gray-700">
                J'accepte les conditions d'utilisation*
              </label>
              <p className="text-gray-500">
                En vous inscrivant, vous acceptez nos{' '}
                <a href="#" className="text-blue-600 hover:underline">
                  conditions d'utilisation
                </a>{' '}
                et notre{' '}
                <a href="#" className="text-blue-600 hover:underline">
                  politique de confidentialité
                </a>
                .
              </p>
              {errors.termsAccepted && (
                <p className="mt-1 text-sm text-red-600">{errors.termsAccepted.message}</p>
              )}
            </div>
          </div>
          
          {/* Boutons */}
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full md:w-auto px-8 py-3 border border-transparent text-base font-medium rounded-md text-white ${
                isSubmitting ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
              } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
            >
              {isSubmitting ? 'Inscription en cours...' : 'S\'inscrire'}
            </button>
            <div className="text-sm">
              Déjà un compte?{' '}
              <Link to="/login" className="font-medium text-blue-600 hover:text-blue-500">
                Connectez-vous
              </Link>
            </div>
          </div>
          
          <div className="text-xs text-gray-500">
            * Champs obligatoires
          </div>
        </form>
      </div>
    </div>
  );
}