import { useState } from "react";
import Button from "@mui/material/Button";

import Radio from "@mui/material/Radio";
import RadioGroup from "@mui/material/RadioGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import FormControl from "@mui/material/FormControl";
import FormLabel from "@mui/material/FormLabel";

const availableInterests = [
  "Photography",
  "Shopping",
  "Karaoke",
  "Yoga",
  "Cooking",
  "Tennis",
  "Art",
  "Traveling",
  "Music",
  "Video games",
  "Swimming",
  "Running",
];

const Setup_page = () => {
  const [formData, setFormData] = useState({
    gender: "",
    sexual_preferences: "",
    biography: "",
    interests: [],
  });

  function toggleInterest(interest) {
    console.log(interest, " is selected");
    console.log(formData.interests, " is selected");
    setFormData(function(prev) {
      return {
        ...prev,
        interests: prev.interests.concat(interest), //  add the interest
      };
    });
  }  
function clearInterest(interest) {
    console.log(interest, " is selected");
    setFormData(function(prev) {
      return {
        ...prev,
        interests: ""
      };
    });
  }
  

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch(
        "http://localhost:3000/api/user/information",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        }
      );

      const data = await response.json();

      if (response.ok) {
        setSuccess("Your information has been submitted successfully.");
        setFormData({
          gender: "",
          sexual_preferences: "",
          biography: "",
          interests: "",
        });
      } else {
        console.log(data, " error");

        setError(data || "Registration failed. Please try again.");
      }
    } catch (error) {
      console.log(error);
      setError("Unable to connect to server. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  //   • Once a user is connected, they must fill out their profile by providing the following
  // information:
  // ◦ The gender.
  // ◦ Sexual preferences.
  // ◦ A biography.
  // ◦ A list of interests with tags (e.g. #vegan, #geek, #piercing, etc.), which must
  // be reusable
  // ◦ Up to 5 pictures, including one to be used as a profile picture.
  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center">
      <div className="w-full max-w-md">
        <div className="bg-[#E94057] rounded-2xl p-6">
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold text-white mb-8">
              Setup Your Account
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <FormControl
                onChange={(e) =>
                  // console.log(e.target.value)
                  setFormData({ ...formData, gender: e.target.value })
                }
              >
                <FormLabel id="gender">Gender</FormLabel>
                <RadioGroup
                  aria-labelledby="gender"
                  defaultValue=""
                  name="radio-buttons-group"
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
                  {/* <FormControlLabel
                    value="other"
                    control={<Radio />}
                    label="Other"
                  /> */}
                </RadioGroup>
              </FormControl>

              {/* 

              <div className="flex gap-4">
                <input
                  type="text"
                  placeholder="First Name"
                  className="w-full bg-gray-800 rounded-xl px-4 py-3 text-white placeholder-gray-400"
                  value={formData.first_name}
                  onChange={(e) =>
                    setFormData({ ...formData, first_name: e.target.value })
                  }
                  required
                />

                <input
                  type="text"
                  placeholder="Last Name"
                  className="w-full bg-gray-800 rounded-xl px-4 py-3 text-white placeholder-gray-400"
                  value={formData.last_name}
                  onChange={(e) =>
                    setFormData({ ...formData, last_name: e.target.value })
                  }
                  required
                />
              </div>

              
              
              */}
              <div className="relative">
                <FormControl
                  onChange={(e) =>
                    // console.log(e.target.value)
                    setFormData({ ...formData, gender: e.target.value })
                  }
                >
                  <FormLabel id="Sexualpreferences">
                    Sexual preferences.
                  </FormLabel>
                  <RadioGroup
                    aria-labelledby="Sexualpreferences."
                    defaultValue=""
                    name="radio-buttons-group"
                  >
                    <FormControlLabel
                      value="Homosexual"
                      control={<Radio />}
                      label="Homosexual"
                    />

                    <FormControlLabel
                      value="heterosexual"
                      control={<Radio />}
                      label="heterosexual"
                    />
                    <FormControlLabel
                      value="bisexual"
                      control={<Radio />}
                      label="bisexual"
                    />
                    <FormControlLabel
                      value="Other"
                      control={<Radio />}
                      label="Other"
                    />
                  </RadioGroup>
                </FormControl>
                <div className=""> Biography</div>
                <input
                  type="text"
                  placeholder="Biography"
                  className="w-full bg-gray-800 rounded-xl px-4 py-3 text-white placeholder-gray-400"
                  value={formData.biography}
                  onChange={(e) =>
                    setFormData({ ...formData, biography: e.target.value })
                  }
                  required
                />
              </div>
              <div className="space-y-6">
            <h2 className="text-2xl font-semibold text-white mb-8">
              Your Interests
            </h2>

            <div className="grid grid-cols-2 gap-3">
              {availableInterests.map(function (interest) {
                return (
                  
                    <button
                      key={interest}
                      onClick={() => toggleInterest(interest)}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-colors
                  ${
                    formData.interests.includes(interest)
                      ? "bg-pink-600 text-white"
                      : "bg-gray-800 text-gray-300 hover:bg-gray-700"
                  }`
                }
                    >
                      {interest}
                    </button>
                );
              })
            }
             <input
                  type="text"
                  placeholder="First Name"
                  className="px-4 py-2 rounded-full text-sm font-medium transition-colors bg-gray-800 text-gray-300 hover:bg-gray-700"
                  value={formData.first_name}
                  // onChange={(e) =>
                  //   setFormData({ ...formData, first_name: e.target.value })
                  // }
                  
                />
         </div>

            <button
              onClick={clearInterest}
              className="w-full bg-pink-600 hover:bg-pink-700 text-white rounded-xl py-3 font-semibold"
            >
              { "Clear Interest"}
            </button>
          </div>

              {error && <div className="text-slate-100 text-sm">{error}</div>}

              {success && <div className="text-white text-sm">{success}</div>}

              <button
                type="submit"
                className="w-full bg-pink-600 hover:bg-pink-700 text-white rounded-xl py-3 font-semibold"
                disabled={isLoading}
              >
                {isLoading ? "Submiting..." : "Submit your information"}
              </button>
            </form>
          </div>
          
        </div>
      </div>
    </div>
  );
};

export default Setup_page;
