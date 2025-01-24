import { useState } from "react";
import Button from "@mui/material/Button";
import Radio from "@mui/material/Radio";
import RadioGroup from "@mui/material/RadioGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import FormControl from "@mui/material/FormControl";
import FormLabel from "@mui/material/FormLabel";
import MonochromePhotosIcon from "@mui/icons-material/MonochromePhotos";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import { TextField } from "@mui/material";

function Setup_page() {
  // Initial interests list
  const defaultInterests = [
    "#Photography",
    "#Shopping",
    "#Karaoke",
    "#Yoga",
    "#Cooking",
    "#Tennis",
    "#Art",
    "#Traveling",
    "#Music",
    "#Video games",
    "#Swimming",
    "#Running",
  ];

  // State declarations
  const [availableInterests, setAvailableInterests] =
    useState(defaultInterests);
  const [new_interest, setNewInterest] = useState("");
  const [formData, setFormData] = useState({
    gender: "",
    // sexual_preferences: "",
    biography: "",
    interests: [],
    profilePicture: null,
    additionalPictures: [],
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Function to handle toggling interests
  function toggleInterest(interest) {
    function updateInterests(prevFormData) {
      // Check if interest already exists
      const interestExists = prevFormData.interests.includes(interest);
      let updatedInterests;

      if (interestExists) {
        // Remove interest if it exists
        updatedInterests = prevFormData.interests.filter(function (item) {
          return item !== interest;
        });
      } else {
        // Add interest if it doesn't exist
        updatedInterests = [...prevFormData.interests, interest];
      }

      return {
        ...prevFormData,
        interests: updatedInterests,
      };
    }

    setFormData(updateInterests);
  }

  // Function to clear all interests
  function clearInterest() {
    function updateFormData(prevFormData) {
      return {
        ...prevFormData,
        interests: [],
      };
    }
    setFormData(updateFormData);
  }

  // Function to handle input change for new interest
  function handleNewInterestChange(event) {
    setNewInterest(event.target.value);
  }

  // Function to add new interest
  function addNewInterest(event) {
    event.preventDefault();

    if (!new_interest || !new_interest.trim()) {
      return;
    }

    // Format the interest with # if it doesn't have one
    let formattedInterest = new_interest.trim();
    if (!formattedInterest.startsWith("#")) {
      formattedInterest = "#" + formattedInterest;
    }

    // Check if interest already exists
    if (!availableInterests.includes(formattedInterest)) {
      // Update available interests
      function updateAvailableInterests(prevInterests) {
        return [...prevInterests, formattedInterest];
      }
      setAvailableInterests(updateAvailableInterests);

      // Update selected interests
      function updateFormData(prevFormData) {
        return {
          ...prevFormData,
          interests: [...prevFormData.interests, formattedInterest],
        };
      }
      setFormData(updateFormData);
    }

    // Clear the input
    setNewInterest("");
  }

  // Function to handle form field changes
  function handleFormChange(field, value) {
    function updateFormData(prevFormData) {
      return {
        ...prevFormData,
        [field]: value,
      };
    }
    setFormData(updateFormData);
  }

  // Function to handle form submission
  async function handleSubmit(event) {
    event.preventDefault();
    setIsLoading(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch(
        "http://localhost:3000/api/user/information",
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        }
      );

      const data = await response.json();

      if (response.ok) {
        setSuccess("Your information has been submitted successfully.");
        // Reset form
        setFormData({
          gender: "",
          // sexual_preferences: "",
          biography: "",
          interests: [],
          profilePicture: null,
          additionalPictures: [],
        });
      } else {
        console.log(data.errors[0].msg, " |||")
        setError(data.errors[0].msg || "Submission failed. Please try again.");
      }
    } catch (error) {
      setError("Unable to connect to server. Please try again later.");
    }

    setIsLoading(false);
  }
  function handleImageUpload(event, isProfile) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function (e) {
      if (isProfile) {
        setFormData(function (prevData) {
          return {
            ...prevData,
            profilePicture: e.target.result,
          };
        });
      } else {
        setFormData(function (prevData) {
          if (prevData.additionalPictures.length >= 4) {
            alert("You can only upload up to 4 additional pictures");
            return prevData;
          }
          return {
            ...prevData,
            additionalPictures: [
              ...prevData.additionalPictures,
              e.target.result,
            ],
          };
        });
      }
    };
    reader.readAsDataURL(file);
  }
  function removeImage(index, isProfile) {
    setFormData(function (prevData) {
      if (isProfile) {
        return {
          ...prevData,
          profilePicture: null,
        };
      }
      const newPictures = [...prevData.additionalPictures];
      newPictures.splice(index, 1);
      return {
        ...prevData,
        additionalPictures: newPictures,
      };
    });
  }
  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center">
      <div className="w-full max-w-md">
        <div className="bg-[#E94057] rounded-2xl p-6">
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold text-white mb-8">
              Setup Your Account
            </h2>

            <form onSubmit={handleSubmit} className="">
              <FormControl>
                <FormLabel id="gender">Gender</FormLabel>
                <RadioGroup
                  aria-labelledby="gender"
                  value={formData.gender}
                  name="gender"
                  onChange={function (event) {
                    handleFormChange("gender", event.target.value);
                  }}
                >
                  <FormControlLabel
                    value="female"
                    control={<Radio />}
                    label="Female"
                  />
                  <FormControlLabel
                    value="male"
                    control={<Radio />}
                    label="Male"
                  />
                </RadioGroup>
              </FormControl>

              {/* <FormControl> */}
                {/* <FormLabel id="sexual_preferences">
                  Sexual preferences
                </FormLabel> */}
                {/* <RadioGroup
                  aria-labelledby="sexual_preferences"
                  value={formData.sexual_preferences}
                  name="sexual_preferences"
                  onChange={function (event) {
                    handleFormChange("sexual_preferences", event.target.value);
                  }}
                >
                  <FormControlLabel
                    value="homosexual"
                    control={<Radio />}
                    label="Homosexual"
                  />
                  <FormControlLabel
                    value="heterosexual"
                    control={<Radio />}
                    label="Heterosexual"
                  />
                  <FormControlLabel
                    value="bisexual"
                    control={<Radio />}
                    label="Bisexual"
                  />
                  <FormControlLabel
                    value="other"
                    control={<Radio />}
                    label="Other"
                  />
                </RadioGroup> */}
              {/* </FormControl> */}

              {/* <div className="relative">
                <div className="text-white mb-2">Biography</div>
                <input
                  type="text"
                  placeholder="Biography"
                  className="w-full bg-gray-800 rounded-xl px-4 py-3 text-white placeholder-gray-400"
                  value={formData.biography}
                  onChange={function(event) {
                    handleFormChange("biography", event.target.value);
                  }}
                  required
                />
              </div> */}
              <TextField
                fullWidth
                label="Biography"
                multiline
                rows={5}
                value={formData.biography}
                inputProps={{
                  maxLength: 200,
                }}
                onChange={(e) =>
                  setFormData({ ...formData, biography: e.target.value })
                }
              />
              <div className="space-y-6">
                <h2 className="text-2xl font-semibold text-white mb-8">
                  Your Interests
                </h2>

                <div className="grid grid-cols-2 gap-3">
                  {availableInterests.map(function (interest) {
                    return (
                      <button
                        type="button"
                        key={interest}
                        onClick={function () {
                          toggleInterest(interest);
                        }}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-colors
                          ${
                            formData.interests.includes(interest)
                              ? "bg-pink-600 text-white"
                              : "bg-gray-800 text-gray-300 hover:bg-gray-700"
                          }`}
                      >
                        {interest === "#Photography" && (
                          <MonochromePhotosIcon className="mr-2" />
                        )}
                        {interest === "#Shopping" && (
                          <ShoppingCartIcon className="mr-2" />
                        )}
                        {interest}
                      </button>
                    );
                  })}

                  <div className="col-span-2 flex gap-2">
                    <input
                      type="text"
                      placeholder="New Interest"
                      className="flex-1 px-4 py-2 rounded-full text-sm font-medium transition-colors bg-gray-800 text-gray-300"
                      value={new_interest}
                      onChange={handleNewInterestChange}
                    />
                    <Button
                      type="button"
                      onClick={addNewInterest}
                      variant="contained"
                    >
                      Add
                    </Button>
                  </div>
                </div>

                {/* Photo upload */}
                <div className="space-y-6">
                  {/* <div className="space-y-4">
                    <h3 className="text-lg font-medium text-white">
                      Profile Picture
                    </h3>
                    <div className="flex items-center space-x-4">
                      {formData.profilePicture ? (
                        <div className="relative">
                          <img
                            src={formData.profilePicture}
                            alt="Profile"
                            className="w-24 h-24 rounded-full object-cover"
                          />
                          <button
                            type="button"
                            onClick={function () {
                              removeImage(0, true);
                            }}
                            className="absolute -top-2 -right-2 bg-red-500 rounded-full p-1 text-white"
                          >
                            ×
                          </button>
                        </div>
                      ) : (
                        <div className="w-24 h-24 border-2 border-dashed border-gray-300 rounded-full flex items-center justify-center">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={function (e) {
                              handleImageUpload(e, true);
                            }}
                            className="hidden"
                            id="profile-upload"
                          />
                          <label
                            htmlFor="profile-upload"
                            className="cursor-pointer text-gray-400 text-sm text-center"
                          >
                            Upload Profile Picture
                          </label>
                        </div>
                      )}
                    </div>
                  </div> */}

                  {/* <div className="space-y-4">
                    <h3 className="text-lg font-medium text-white">
                      Additional Pictures
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                      {formData.additionalPictures.map(function (pic, index) {
                        return (
                          <div key={index} className="relative">
                            <img
                              src={pic}
                              alt={`Additional ${index + 1}`}
                              className="w-full h-32 object-cover rounded-lg"
                            />
                            <button
                              type="button"
                              onClick={function () {
                                removeImage(index, false);
                              }}
                              className="absolute -top-2 -right-2 bg-red-500 rounded-full p-1 text-white"
                            >
                              ×
                            </button>
                          </div>
                        );
                      })}
                      {formData.additionalPictures.length < 4 && (
                        <div className="w-full h-32 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={function (e) {
                              handleImageUpload(e, false);
                            }}
                            className="hidden"
                            id="additional-upload"
                          />
                          <label
                            htmlFor="additional-upload"
                            className="cursor-pointer text-gray-400 text-sm text-center"
                          >
                            Upload Picture
                          </label>
                        </div>
                      )}
                    </div>
                  </div> */}
                </div>

                <button
                  type="button"
                  onClick={clearInterest}
                  className="w-full bg-pink-600 hover:bg-pink-700 text-white rounded-xl py-3 font-semibold"
                >
                  Clear Interest
                </button>
              </div>

              {error && (
                <div className="text-red-500 text-sm bg-red-100 p-2 rounded">
                  {error}
                </div>
              )}
              {success && (
                <div className="text-green-500 text-sm bg-green-100 p-2 rounded">
                  {success}
                </div>
              )}

              <button
                type="submit"
                className="w-full bg-pink-600 hover:bg-pink-700 text-white rounded-xl py-3 font-semibold"
                disabled={isLoading}
              >
                {isLoading ? "Submitting..." : "Submit your information"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Setup_page;
