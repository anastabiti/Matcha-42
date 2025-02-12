import { useState } from "react";
import Button from "@mui/material/Button";
import Radio from "@mui/material/Radio";
import RadioGroup from "@mui/material/RadioGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import FormControl from "@mui/material/FormControl";
import FormLabel from "@mui/material/FormLabel";
import { TextField } from "@mui/material";
import AddPhotoAlternateIcon from "@mui/icons-material/AddPhotoAlternate";
import { useNavigate } from "react-router-dom";

type FormData= {


  gender: string;
  biography: string;
  interests: string[];
  age: Number;
  pics: string[];
}

import {
  PhotoCamera,
  ShoppingCart,
  Mic,
  SelfImprovement,
  Restaurant,
  SportsTennis,
  Palette,
  Flight,
  MusicNote,
  SportsEsports,
  Pool,
  DirectionsRun
} from "@mui/icons-material";
import Gps from "./Gps";

type FormFields = "gender" | "biography" | "interests";

function Setup_page() {
  // Initial interests list
  const defaultInterests: string[] = [
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
    "#Running"
  ];

  // State declarations
  const [availableInterests, setAvailableInterests] =
    useState(defaultInterests);
  const [new_interest, setNewInterest] = useState("");
  const [formData, setFormData] = useState<FormData>({
    gender: "",
    biography: "",
    interests: [],
    age: 18,
    pics:[]
  });

  const navigate = useNavigate();

  const [images_url, setimages_url] = useState(Array(5).fill(null));
  const [images_FILES, setImages_file] = useState(Array(5).fill(null));

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");


  // Function to handle toggling interests
  function toggleInterest(interest: string) {
    function updateInterests(prevFormData: FormData): FormData {
      // Check if interest already exists
      const interestExists = prevFormData.interests.includes(interest);
      let updatedInterests: string[];

      if (interestExists) {
        // Remove interest if it exists
        updatedInterests = prevFormData.interests.filter(function (
          item: string
        ) {
          return item !== interest;
        });
      } else {
        // Add interest if it doesn't exist
        updatedInterests = [...prevFormData.interests, interest];
      }

      return {
        ...prevFormData,
        interests: updatedInterests
      };
    }

    setFormData(updateInterests);
  }

  // Function to clear all interests
  function clearInterest(): void {
    function updateFormData(prevFormData: FormData): FormData {
      return {
        ...prevFormData,
        interests: []
      };
    }
    setFormData(updateFormData);
  }

  // Function to handle input change for new interest
  function handleNewInterestChange(
    event: React.ChangeEvent<HTMLInputElement>
  ): void {
    setNewInterest(event.target.value);
  }

  // Function to add new interest
  function addNewInterest(event: React.FormEvent): void {
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
      function updateAvailableInterests(prevInterests: string[]) {
        return [...prevInterests, formattedInterest];
      }
      setAvailableInterests(updateAvailableInterests);

      // Update selected interests
      function updateFormData(prevFormData: FormData): FormData {
        return {
          ...prevFormData,
          interests: [...prevFormData.interests, formattedInterest]
        };
      }
      setFormData(updateFormData);
    }

    // Clear the input
    setNewInterest("");
  }

  // Function to handle form field changes
  function handleFormChange(field: FormFields, value: string) {
    function updateFormData(prevFormData: FormData) {
      return {
        ...prevFormData,
        [field]: value
      };
    }
    setFormData(updateFormData);
  }

  const handle_image_change = (
    event: React.ChangeEvent<HTMLInputElement>,
    index: number
  ) => {
    console.log(index, " index");
    console.log(event.target.files, " <--]event.target.files");
    // const file = event.target.files[0];
    const files = event.target.files;
    if (!files) return;
    const file = files[0];
    if (!file) return;
    // console.log(file, " ]file");
    if (file) {
      let image_url = URL.createObjectURL(file); // Generate object URL for the file
      console.log(image_url, " ]image_url");
      setimages_url((prevImages) => {
        const updatedImages = [...prevImages]; // Make a copy of the images array
        updatedImages[index] = image_url;
        return updatedImages;
      });
      setImages_file((prevImages) => {
        const updatedImages = [...prevImages]; // Make a copy of the images array
        updatedImages[index] = file;
        return updatedImages; // Return the updated images array
      });
    }
  };

  function generateImageUploadDivs() {
    const imageUploadDivs = [];
    for (let i = 0; i < 5; i++) {
      imageUploadDivs.push(
        <div key={i} className="flex justify-center">
          <label className="w-32 h-32 flex items-center  justify-center border-2 border-dashed border-gray-300 rounded-full cursor-pointer hover:border-blue-500">
            {images_url[i] ? (
              <img
                src={images_url[i]}
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              <AddPhotoAlternateIcon
                fontSize="large"
                className="text-gray-500"
              />
            )}
            <input
              id={`image_file_${i}`}
              type="file"
              accept="image/*"
              onChange={function (e) {
                handle_image_change(e, i);
              }}
              className="hidden"
            />
          </label>
        </div>
      );
    }
    return <div className="grid grid-cols-2 gap-4">{imageUploadDivs}</div>;
  }

  // Function to handle form submission
  async function handleSubmit(event: React.FormEvent): Promise<void> {
    event.preventDefault();
    setIsLoading(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_IP}/api/user/information`,
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(formData)
        }
      );

      const data = await response.json();

      if (response.ok) {
        if (images_FILES) {
          const new_data = new FormData();
          console.log(
            images_FILES,
            " -------------------....>>>.....images_FILES"
          );

          images_FILES.forEach(function (file, index) {
            const key = index.toString(); // Convert index to string
            if (file) {
              new_data.append(key, file);
            } else {
              new_data.append(key, "NULL");
            }
          });
          
          await fetch(`${import.meta.env.VITE_BACKEND_IP}/api/user/upload`, {
            method: "POST",
            credentials: "include",
            body: new_data
          });
        }
        setSuccess("Your information has been submitted successfully.");
        // Reset form
        setFormData({
          gender: data.gender || "",
          biography: data["biography:"] || "",
          interests: data.tags || [],
          pics: data.pics || [],
          age: data.age
        });
        // setFormData({
        //   gender: "",
        //   // sexual_preferences: "",
        //   biography: "",
        //   interests: [],
        //   age:18
        // });

        navigate("/discover");
      } else {
        console.log(data, " |||");
        console.log(data, " |||");
        setError(data || "Submission failed. Please try again.");
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError("Unable to connect to server. Please try again later.");
      }
    }

    setIsLoading(false);
  }

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-12">
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
              <TextField
                fullWidth
                type="number"
                label="Age"
                placeholder="Age"
                inputProps={{ min: 18, max: 100 }}
                value={formData.age ?? ""}
                onChange={(e) => {
                  const { value } = e.target;
                  //  input is cleared
                  if (value === "") {
                    setFormData({ ...formData, age: 18 });
                    return;
                  }
                  // Convert the input string to a number
                  const parsedAge = parseInt(value, 10);
                  // Check if parsedAge is a valid number and within the accepted range
                  if (
                    !isNaN(parsedAge) &&
                    parsedAge >= 18 &&
                    parsedAge <= 100
                  ) {
                    setFormData({ ...formData, age: parsedAge });
                  }
                }}
                required
                className="bg-white rounded"
              />
              <TextField
                fullWidth
                label="Biography"
                multiline
                rows={4}
                inputProps={{
                  minLength: 20,
                  maxLength: 200
                }}
                value={formData.biography}
                onChange={(e) => {
                  // Prevent input beyond 200 characters
                  if (e.target.value.length <= 200) {
                    handleFormChange("biography", e.target.value);
                  }
                }}
                className="bg-white rounded"
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
                        {/* {interest === "#Photography" && (
                          <MonochromePhotosIcon className="mr-2" />
                        )}
                        {interest === "#Shopping" && (
                          <ShoppingCartIcon className="mr-2" />
                        )}
                        {interest} */}
                        {interest === "#Photography" && (
                          <PhotoCamera className="mr-2" />
                        )}
                        {interest === "#Shopping" && (
                          <ShoppingCart className="mr-2" />
                        )}
                        {interest === "#Karaoke" && <Mic className="mr-2" />}
                        {interest === "#Yoga" && (
                          <SelfImprovement className="mr-2" />
                        )}
                        {interest === "#Cooking" && (
                          <Restaurant className="mr-2" />
                        )}
                        {interest === "#Tennis" && (
                          <SportsTennis className="mr-2" />
                        )}
                        {interest === "#Art" && <Palette className="mr-2" />}
                        {interest === "#Traveling" && (
                          <Flight className="mr-2" />
                        )}
                        {interest === "#Music" && (
                          <MusicNote className="mr-2" />
                        )}
                        {interest === "#Video games" && (
                          <SportsEsports className="mr-2" />
                        )}
                        {interest === "#Swimming" && <Pool className="mr-2" />}
                        {interest === "#Running" && (
                          <DirectionsRun className="mr-2" />
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

                {/* <div>
                  <AddPhotoAlternateIcon fontSize="large" />
                  Profile Image
                  <input
                    accept="image/*"
                    onChange={function (e) {
                      handle_image_change(e);
                    }}
                    type="file"
                    name="image_file"
                  >
                  </input>
                </div> */}
                {/* <div>
                    <AddPhotoAlternateIcon fontSize="large" />
                  <input
                    id="image_file"
                    accept="image/*"
                    onChange={(e) => handle_image_change(e)}
                    type="file"
                    name="image_file"
                    style={{ display: "none" }}
                  />
                </div> */}

                <div>{generateImageUploadDivs()}</div>
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
            <Gps></Gps>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Setup_page;
