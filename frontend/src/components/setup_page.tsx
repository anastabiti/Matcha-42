import { useState } from "react";
import Button from "@mui/material/Button";
import axios from 'axios';

import Radio from "@mui/material/Radio";
import RadioGroup from "@mui/material/RadioGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import FormControl from "@mui/material/FormControl";
import FormLabel from "@mui/material/FormLabel";
import MonochromePhotosIcon from "@mui/icons-material/MonochromePhotos";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
let availableInterests = [
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

const Setup_page = () => {
  const [new_interest, setNewInterest] = useState("");
  const [formData, setFormData] = useState({
    gender: "",
    sexual_preferences: "",
    biography: "",
    interests: [],
  });

  function toggleInterest(interest) {
    console.log(interest, " is selected");
    console.log(formData.interests, " is selected");
    setFormData(function (prev) {
      return {
        ...prev,
        interests: prev.interests.concat(interest), //  add the interest
      };
    });
  }
  function clearInterest(interest) {
    console.log(interest, " is selected");
    availableInterests = [
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
    setFormData(function (prev) {
      return {
        ...prev,
        interests: "",
      };
    });
  }

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const handleKeyPress = (e) => {
    // if (e.key === "Enter") {
    //   e.preventDefault(); // Prevent the form from submitting
    // }
  };

  
  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setSuccess("");

    try {
      console.log("---------------------------->>>>>>");

      // const response = await axios.post(
      //   "http://localhost:3000/api/user/information",
      //   formData,
      //   {
      //     withCredentials: true,
      //   }
      // )

      const response = await fetch(
        "http://localhost:3000/api/user/information",
        {
          method: "POST",
          // credentials: "include",
          // headers: {
          //   "Content-Type": "application/json",
          // },  
          credentials: "include",

          body: JSON.stringify(formData),
        }
      );
      // const data = response.data;
      const data = await response.json();

      if (response.ok) {
        setSuccess("Your information has been submitted successfully.");
        setFormData({
          gender: "",
          sexual_preferences: "",
          biography: "",
          interests: [],
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





  function new_interest_func(event) {

    console.log(event)
    console.log("new interest is added")
    console.log(new_interest)
    if(new_interest ){
    formData.interests.push(new_interest)
    availableInterests.push(new_interest)
    }
    // reinitialize the new_interest
    setNewInterest("")
  }

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

                onKeyDown={handleKeyPress} // or onKeyPress
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
                  onKeyDown={handleKeyPress} // or onKeyPress
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
                  onKeyDown={handleKeyPress} // or onKeyPress
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
                        onKeyDown={handleKeyPress}
                        key={interest}
                        onMouseDown={() => toggleInterest(interest)}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-colors
                
                        ${
                          formData.interests.includes(interest)
                            ? "bg-pink-600 text-white"
                            : "bg-gray-800 text-gray-300 hover:bg-gray-700"
                        }`}
                      >
                        {/* https://mui.com/material-ui/material-icons/?srsltid=AfmBOorzxu5HZpam9QMOwl9vd3YaJ-WeennL1M_wEWXUInvSUM_tcAA5&query=Shopping */}
                        {interest === "#Photography" && (
                          <MonochromePhotosIcon className="mr-2" />
                        )}
                        {interest == "#Shopping" && (
                          <ShoppingCartIcon className="mr-2" />
                        )}
                        {interest}
                      </button>
                    );
                  })}
                  <input
                    type="text"
                    placeholder="New Interest"
                    className="px-4 py-2 rounded-full text-sm font-medium transition-colors bg-gray-800 text-gray-300 hover:bg-gray-700"
                    value={new_interest}
                    onChange={(e) =>
                      setNewInterest(e.target.value)
                    }
                    />
                    <Button onClick={new_interest_func} >Add new interest</Button>
                </div>

                <button
                  onClick={clearInterest}
                  className="w-full bg-pink-600 hover:bg-pink-700 text-white rounded-xl py-3 font-semibold"
                >
                  {"Clear Interest"}
                </button>
              </div>
              {error && <div className="text-slate-100 text-sm">{error}</div>}
              {success && <div className="text-white text-sm">{success}</div>}
              <button
                type="submit"
                className="w-full bg-pink-600 hover:bg-pink-700 text-white rounded-xl py-3 font-semibold"
                // disabled={isLoading}
              >
                {"Submit your information"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Setup_page;
