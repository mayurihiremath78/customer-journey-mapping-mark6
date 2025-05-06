import React, { useState, useEffect } from 'react';
import Button from '../ui/Button';

interface JourneyFormProps {
  stage: string;
  product: any;
  productId?: string;
  userId?: number;
  initialData?: Record<string, any>; // Add this to pre-fill form fields
  onSubmit: (data: Record<string, any>) => void;
  onBack?: () => void;
  isFinalStage?: boolean; // Add this to change button text
}

const JourneyForm: React.FC<JourneyFormProps> = ({ 
  stage, 
  product, 
  productId: propProductId, 
  userId: propUserId,
  initialData = {}, 
  onSubmit, 
  onBack,
  isFinalStage = false
}) => {
  const [formData, setFormData] = useState<Record<string, any>>(initialData);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submissionError, setSubmissionError] = useState<string | null>(null);

  useEffect(() => {
    // Update form data when initialData or stage changes
    setFormData(initialData);
  }, [initialData, stage]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    // For checkboxes
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({
        ...prev,
        [name]: checked
      }));
      console.log(`Updated checkbox ${name} to:`, checked);
    } 
    // For radio buttons
    else if (type === 'radio') {
      const newValue = value === 'true' ? true : value === 'false' ? false : value;
      setFormData(prev => ({
        ...prev,
        [name]: newValue
      }));
      console.log(`Updated radio ${name} to:`, newValue);
    } 
    // For other inputs
    else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
      console.log(`Updated field ${name} to:`, value);
    }
  };
  
  // Add this function to validate the form
  const validateForm = (): boolean => {
    // For the final stage, validate required fields
    if (stage === 'support' && isFinalStage) {
      // Review is required
      if (!formData.review?.trim()) {
        setSubmissionError('Please provide a review before submitting');
        return false;
      }
      
      // If contacted support is true, validate those fields
      if (formData.contactedSupport === true) {
        if (!formData.contactReason) {
          setSubmissionError('Please select a reason for contacting support');
          return false;
        }
        if (!formData.responseTime) {
          setSubmissionError('Please select a response time');
          return false;
        }
      }
    }
    
    return true;
  };

  // Update the handleContinue function to use validation
  const handleContinue = async () => {
    console.log('Handle continue called with form data:', formData);
    
    // Validate the form
    if (!validateForm()) {
      return;
    }
    
    // Clear previous errors
    setSubmissionError(null);
    
    // Indicate submission is in progress
    setIsSubmitting(true);
    
    try {
      // Call the onSubmit prop with the form data
      await onSubmit(formData);
    } catch (error) {
      console.error('Error submitting form:', error);
      setSubmissionError('An error occurred while submitting. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStepForm = () => {
    switch (stage) {
      case 'awareness':
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-800">Awareness Stage</h3>
            <p className="text-gray-600 mb-4">How did you first learn about {product.name}?</p>

            <div className="form-control">
              <label className="block text-sm font-medium text-gray-700 mb-1">Source</label>
              <select
                name="awarenessSource"
                value={formData.awarenessSource || ''}
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-300 rounded-md"
              >
                <option value="">Select source</option>
                <option value="Social Media">Social Media</option>
                <option value="Friend/Family">Friend or Family</option>
                <option value="YouTube">YouTube</option>
                <option value="Online Ad">Online Advertisement</option>
                <option value="In Store">In Store</option>
                <option value="Tech Blog">Tech Blog/Website</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="form-control">
              <label className="block text-sm font-medium text-gray-700 mb-1">Initial Impression</label>
              <select
                name="initialImpression"
                value={formData.initialImpression || ''}
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-300 rounded-md"
              >
                <option value="">Select impression</option>
                <option value="Very Positive">Very Positive</option>
                <option value="Positive">Positive</option>
                <option value="Neutral">Neutral</option>
                <option value="Negative">Negative</option>
                <option value="Very Negative">Very Negative</option>
              </select>
            </div>

            <div className="form-control">
              <label className="block text-sm font-medium text-gray-700 mb-1">Interest Level (1-5)</label>
              <input
                type="number"
                name="awarenessRating"
                min="1"
                max="5"
                value={formData.awarenessRating || ''}
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-300 rounded-md"
                placeholder="Rate from 1-5"
              />
            </div>
          </div>
        );

      case 'consideration':
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-800">Consideration Stage</h3>
            <p className="text-gray-600 mb-4">Tell us about your research process.</p>

            <div className="form-control">
              <label className="block text-sm font-medium text-gray-700 mb-1">Alternatives Considered</label>
              <textarea
                name="alternativesConsidered"
                value={formData.alternativesConsidered || ''}
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-300 rounded-md"
                rows={2}
                placeholder="What other products did you consider?"
              />
            </div>

            <div className="form-control">
              <label className="block text-sm font-medium text-gray-700 mb-2">Research Methods</label>
              <div className="space-y-2">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="researchMethod_YouTube"
                    name="researchMethod_YouTube"
                    checked={formData.researchMethod_YouTube || false}
                    onChange={handleInputChange}
                    className="h-4 w-4 text-indigo-600 border-gray-300 rounded"
                  />
                  <label htmlFor="researchMethod_YouTube" className="ml-2">YouTube Reviews</label>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="researchMethod_TechBlogs"
                    name="researchMethod_TechBlogs"
                    checked={formData.researchMethod_TechBlogs || false}
                    onChange={handleInputChange}
                    className="h-4 w-4 text-indigo-600 border-gray-300 rounded"
                  />
                  <label htmlFor="researchMethod_TechBlogs" className="ml-2">Tech Blogs/Websites</label>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="researchMethod_SocialMedia"
                    name="researchMethod_SocialMedia"
                    checked={formData.researchMethod_SocialMedia || false}
                    onChange={handleInputChange}
                    className="h-4 w-4 text-indigo-600 border-gray-300 rounded"
                  />
                  <label htmlFor="researchMethod_SocialMedia" className="ml-2">Social Media</label>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="researchMethod_FriendsFamily"
                    name="researchMethod_FriendsFamily"
                    checked={formData.researchMethod_FriendsFamily || false}
                    onChange={handleInputChange}
                    className="h-4 w-4 text-indigo-600 border-gray-300 rounded"
                  />
                  <label htmlFor="researchMethod_FriendsFamily" className="ml-2">Friends/Family</label>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="researchMethod_InStore"
                    name="researchMethod_InStore"
                    checked={formData.researchMethod_InStore || false}
                    onChange={handleInputChange}
                    className="h-4 w-4 text-indigo-600 border-gray-300 rounded"
                  />
                  <label htmlFor="researchMethod_InStore" className="ml-2">In-store Demo</label>
                </div>
              </div>
            </div>

            <div className="form-control">
              <label className="block text-sm font-medium text-gray-700 mb-2">Key Features</label>
              <div className="space-y-2">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="keyFeature_SoundQuality"
                    name="keyFeature_SoundQuality"
                    checked={formData.keyFeature_SoundQuality || false}
                    onChange={handleInputChange}
                    className="h-4 w-4 text-indigo-600 border-gray-300 rounded"
                  />
                  <label htmlFor="keyFeature_SoundQuality" className="ml-2">Sound Quality</label>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="keyFeature_NoiseCancellation"
                    name="keyFeature_NoiseCancellation"
                    checked={formData.keyFeature_NoiseCancellation || false}
                    onChange={handleInputChange}
                    className="h-4 w-4 text-indigo-600 border-gray-300 rounded"
                  />
                  <label htmlFor="keyFeature_NoiseCancellation" className="ml-2">Noise Cancellation</label>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="keyFeature_BatteryLife"
                    name="keyFeature_BatteryLife"
                    checked={formData.keyFeature_BatteryLife || false}
                    onChange={handleInputChange}
                    className="h-4 w-4 text-indigo-600 border-gray-300 rounded"
                  />
                  <label htmlFor="keyFeature_BatteryLife" className="ml-2">Battery Life</label>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="keyFeature_Comfort"
                    name="keyFeature_Comfort"
                    checked={formData.keyFeature_Comfort || false}
                    onChange={handleInputChange}
                    className="h-4 w-4 text-indigo-600 border-gray-300 rounded"
                  />
                  <label htmlFor="keyFeature_Comfort" className="ml-2">Comfort</label>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="keyFeature_Price"
                    name="keyFeature_Price"
                    checked={formData.keyFeature_Price || false}
                    onChange={handleInputChange}
                    className="h-4 w-4 text-indigo-600 border-gray-300 rounded"
                  />
                  <label htmlFor="keyFeature_Price" className="ml-2">Price</label>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="keyFeature_Brand"
                    name="keyFeature_Brand"
                    checked={formData.keyFeature_Brand || false}
                    onChange={handleInputChange}
                    className="h-4 w-4 text-indigo-600 border-gray-300 rounded"
                  />
                  <label htmlFor="keyFeature_Brand" className="ml-2">Brand Reputation</label>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="keyFeature_Design"
                    name="keyFeature_Design"
                    checked={formData.keyFeature_Design || false}
                    onChange={handleInputChange}
                    className="h-4 w-4 text-indigo-600 border-gray-300 rounded"
                  />
                  <label htmlFor="keyFeature_Design" className="ml-2">Design/Aesthetics</label>
                </div>
              </div>
            </div>
          </div>
        );

      case 'purchase':
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-800">Purchase Stage</h3>
            <p className="text-gray-600 mb-4">Tell us about your purchase decision.</p>

            <div className="form-control">
              <label className="block text-sm font-medium text-gray-700 mb-1">Where did you purchase from?</label>
              <select
                name="purchaseLocation"
                value={formData.purchaseLocation || ''}
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-300 rounded-md"
              >
                <option value="">Select location</option>
                <option value="Brand Website">Brand Website</option>
                <option value="Amazon">Amazon</option>
                <option value="Electronics Store">Electronics Store</option>
                <option value="Department Store">Department Store</option>
                <option value="Other Online">Other Online Retailer</option>
                <option value="Other Physical">Other Physical Store</option>
              </select>
            </div>

            <div className="form-control">
              <label className="block text-sm font-medium text-gray-700 mb-1">Key Decision Factor</label>
              <select
                name="decisionFactor"
                value={formData.decisionFactor || ''}
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-300 rounded-md"
              >
                <option value="">Select factor</option>
                <option value="Price">Price</option>
                <option value="Features">Features</option>
                <option value="Brand">Brand</option>
                <option value="Reviews">Reviews</option>
                <option value="Recommendation">Recommendation</option>
                <option value="Availability">Availability</option>
                <option value="Promotion">Promotion/Sale</option>
              </select>
            </div>

            <div className="form-control">
              <label className="block text-sm font-medium text-gray-700 mb-1">Purchase Price (₹) </label>
              <input
                type="number"
                name="purchasePrice"
                min="0"
                step="0.01"
                value={formData.purchasePrice || ''}
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-300 rounded-md"
                placeholder="Enter amount paid"
              />
            </div>
          </div>
        );

      case 'postPurchase':
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-800">Post-Purchase Stage</h3>
            <p className="text-gray-600 mb-4">Tell us about your experience using the product.</p>

            <div className="form-control">
              <label className="block text-sm font-medium text-gray-700 mb-1">Usage Frequency</label>
              <select
                name="usageFrequency"
                value={formData.usageFrequency || ''}
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-300 rounded-md"
              >
                <option value="">Select frequency</option>
                <option value="Daily">Daily</option>
                <option value="Several times a week">Several times a week</option>
                <option value="Once a week">Once a week</option>
                <option value="Few times a month">Few times a month</option>
                <option value="Rarely">Rarely</option>
              </select>
            </div>

            <div className="form-control">
              <label className="block text-sm font-medium text-gray-700 mb-1">Satisfaction (1-5)</label>
              <input
                type="number"
                name="satisfaction"
                min="1"
                max="5"
                value={formData.satisfaction || ''}
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-300 rounded-md"
                placeholder="Rate from 1-5"
              />
            </div>

            <div className="form-control">
              <label className="block text-sm font-medium text-gray-700 mb-1">Would you recommend this product?</label>
              <div className="space-y-2 mt-2">
                <div className="flex items-center">
                  <input
                    type="radio"
                    id="recommend-yes"
                    name="wouldRecommend"
                    value="true"
                    checked={formData.wouldRecommend === true}
                    onChange={handleInputChange}
                    className="h-4 w-4 text-indigo-600 border-gray-300"
                  />
                  <label htmlFor="recommend-yes" className="ml-2">Yes</label>
                </div>
                <div className="flex items-center">
                  <input
                    type="radio"
                    id="recommend-no"
                    name="wouldRecommend"
                    value="false"
                    checked={formData.wouldRecommend === false}
                    onChange={handleInputChange}
                    className="h-4 w-4 text-indigo-600 border-gray-300"
                  />
                  <label htmlFor="recommend-no" className="ml-2">No</label>
                </div>
              </div>
            </div>
          </div>
        );

      case 'support':
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-800">Support Stage</h3>
            <p className="text-gray-600 mb-4">Tell us about any support interactions you've had.</p>

            <div className="form-control">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Have you contacted customer support?
              </label>
              <div className="space-y-2 mt-2">
                <div className="flex items-center">
                  <input
                    type="radio"
                    id="contacted-yes"
                    name="contactedSupport"
                    value="true"
                    checked={formData.contactedSupport === true}
                    onChange={handleInputChange}
                    className="h-4 w-4 text-indigo-600 border-gray-300"
                  />
                  <label htmlFor="contacted-yes" className="ml-2">Yes</label>
                </div>
                <div className="flex items-center">
                  <input
                    type="radio"
                    id="contacted-no"
                    name="contactedSupport"
                    value="false"
                    checked={formData.contactedSupport === false}
                    onChange={handleInputChange}
                    className="h-4 w-4 text-indigo-600 border-gray-300"
                  />
                  <label htmlFor="contacted-no" className="ml-2">No</label>
                </div>
              </div>
            </div>

            {formData.contactedSupport && (
              <>
                <div className="form-control">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Reason for Contact</label>
                  <select
                    name="contactReason"
                    value={formData.contactReason || ''}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 rounded-md"
                  >
                    <option value="">Select reason</option>
                    <option value="Technical Issue">Technical Issue</option>
                    <option value="Warranty Claim">Warranty Claim</option>
                    <option value="Return/Refund">Return/Refund</option>
                    <option value="Product Question">Product Question</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div className="form-control">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Response Time</label>
                  <select
                    name="responseTime"
                    value={formData.responseTime || ''}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 rounded-md"
                  >
                    <option value="">Select timeframe</option>
                    <option value="Same day">Same day</option>
                    <option value="1-2 days">1-2 days</option>
                    <option value="3-5 days">3-5 days</option>
                    <option value="Over a week">Over a week</option>
                    <option value="Never responded">Never responded</option>
                  </select>
                </div>

                <div className="form-control">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Was your issue resolved?</label>
                  <div className="space-y-2 mt-2">
                    <div className="flex items-center">
                      <input
                        type="radio"
                        id="resolved-yes"
                        name="issueResolved"
                        value="true"
                        checked={formData.issueResolved === true}
                        onChange={handleInputChange}
                        className="h-4 w-4 text-indigo-600 border-gray-300"
                      />
                      <label htmlFor="resolved-yes" className="ml-2">Yes</label>
                    </div>
                    <div className="flex items-center">
                      <input
                        type="radio"
                        id="resolved-no"
                        name="issueResolved"
                        value="false"
                        checked={formData.issueResolved === false}
                        onChange={handleInputChange}
                        className="h-4 w-4 text-indigo-600 border-gray-300"
                      />
                      <label htmlFor="resolved-no" className="ml-2">No</label>
                    </div>
                  </div>
                </div>

                <div className="form-control">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Support Satisfaction (1-5)</label>
                  <input
                    type="number"
                    name="supportSatisfaction"
                    min="1"
                    max="5"
                    value={formData.supportSatisfaction || ''}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 rounded-md"
                    placeholder="Rate from 1-5"
                  />
                </div>
              </>
            )}

            <div className="form-control">
              <label className="block text-sm font-medium text-gray-700 mb-1">Overall Satisfaction (1-5)</label>
              <input
                type="number"
                name="overallSatisfaction"
                min="1"
                max="5"
                value={formData.overallSatisfaction || ''}
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-300 rounded-md"
                placeholder="Rate from 1-5"
              />
            </div>

            <div className="form-control">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <span className="text-red-500">*</span> Review
              </label>
              <textarea
                name="review"
                value={formData.review || ''}
                onChange={handleInputChange}
                className={`w-full p-2 border rounded-md ${
                  formData.review ? 'border-gray-300' : 'border-red-300'
                }`}
                rows={3}
                placeholder="Please share your overall experience with the product..."
                required
              />
              {!formData.review && (
                <p className="text-sm text-red-500 mt-1">
                  Please provide a review before submitting
                </p>
              )}
            </div>
          </div>
        );

      default:
        return <p>Unknown stage: {stage}</p>;
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      {renderStepForm()}
      
      {submissionError && (
        <div className="mt-4 p-3 bg-red-100 border border-red-200 rounded-md text-red-800">
          {submissionError}
        </div>
      )}
      
      <div className="flex justify-between mt-6">
        {onBack && (
          <Button 
            type="button" 
            onClick={onBack} 
            variant="outline"
            disabled={isSubmitting}
          >
            Back
          </Button>
        )}
        
        {/* <Button 
          type="button" 
          onClick={handleContinue} 
          variant="primary"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <span className="inline-block animate-spin mr-2">⏳</span>
              Submitting...
            </>
          ) : isFinalStage ? (
            'Submit'
          ) : (
            'Continue'
          )}
        </Button> */}

<Button 
  type="button" 
  onClick={handleContinue} 
  variant="primary"
  disabled={isSubmitting}
>
  {isSubmitting ? (
    <>
      <span className="inline-block animate-spin mr-2">⏳</span>
      Submitting...
    </>
  ) : isFinalStage ? (
    <>
      <span onClick={() => alert("Thank you for your feedback!")}>Submit</span>
    </>
  ) : (
    'Continue'
  )}
</Button>

      </div>
    </div>
  );
};

export default JourneyForm;