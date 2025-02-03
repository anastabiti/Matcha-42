import { useState, useEffect } from "react";
import Button from "@mui/material/Button";
import Radio from "@mui/material/Radio";
import RadioGroup from "@mui/material/RadioGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import FormControl from "@mui/material/FormControl";
import FormLabel from "@mui/material/FormLabel";
import MonochromePhotosIcon from "@mui/icons-material/MonochromePhotos";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import { TextField } from "@mui/material";
import AddPhotoAlternateIcon from "@mui/icons-material/AddPhotoAlternate";
import { useNavigate } from "react-router-dom";

interface FormData {
  last_name: string;
  first_name: string;
  email: string;
  gender: string;
  biography: string;
  interests: string[];
}

interface UserInfo {
  username: string;
  profile_picture: string;
  last_name: string;
  "first_name:": string;
  "email:": string;
  "biography:": string;
  pic_1: string | null;
  pic_2: string | null;
  pic_3: string | null;
  pic_4: string | null;
  pics: string[];
  gender: string;
  tags: string[];
}

type FormFields =
  | "gender"
  | "biography"
  | "interests"
  | "last_name"
  | "first_name"
  | "email";

function Profile() {
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
    "#Running"
  ];

  interface EmailChangeForm {
    newEmail: string;
    password: string;
  }

  const [availableInterests, setAvailableInterests] =
    useState(defaultInterests);
  const [new_interest, setNewInterest] = useState("");
  const [formData, setFormData] = useState<FormData>({
    last_name: "",
    first_name: "",
    email: "",
    gender: "",
    biography: "",
    interests: [],
    age:18
  });

  const navigate = useNavigate();
  const [images_url, setimages_url] = useState<(string | null)[]>(
    Array(5).fill(null)
  );
  const [images_FILES, setImages_file] = useState<(File | null)[]>(
    Array(5).fill(null)
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  // Email change state
  const [emailForm, setEmailForm] = useState<EmailChangeForm>({
    newEmail: "",
    password: ""
  });
  const [emailChangeError, setEmailChangeError] = useState("");
  const [emailChangeSuccess, setEmailChangeSuccess] = useState("");
  const [isEmailChangeLoading, setIsEmailChangeLoading] = useState(false);

  // Fetch user data on component mount
  useEffect(function () {
    async function fetchUserInfo() {
      try {
        const response = await fetch("http://localhost:3000/api/user/info", {
          credentials: "include"
        });
        if (response.ok) {
          const data: UserInfo = await response.json();
          console.log(data.pics, "        pics ----");
          setFormData({
            last_name: data.last_name || "",
            first_name: data["first_name:"] || "",
            email: data["email:"] || "",
            gender: data.gender || "",
            biography: data["biography:"] || "",
            interests: data.tags || [],
            pics: data.pics || [],
            age:data.age
          });
          if (data.tags) {
            setAvailableInterests([]);
            setAvailableInterests(data.tags);
          }

          setimages_url([
            data.pics[0] || null,
            data.pics[1] || null,
            data.pics[2] || null,
            data.pics[3] || null
          ]);
        }
        if (response.status == 405) {
          navigate("/setup");
        }
      } catch (error) {
        console.error("Error fetching user info:", error);
        setError("Failed to load user information");
      }
    }

    fetchUserInfo();
  }, []);

  function toggleInterest(interest: string) {
    setFormData(function (prevFormData) {
      const interestExists = prevFormData.interests.includes(interest);
      const updatedInterests = interestExists
        ? prevFormData.interests.filter(function (item) {
            return item !== interest;
          })
        : [...prevFormData.interests, interest];

      return {
        ...prevFormData,
        interests: updatedInterests
      };
    });
  }
  async function handleEmailChange(e: React.FormEvent) {
    e.preventDefault();
    setIsEmailChangeLoading(true);
    setEmailChangeError("");
    setEmailChangeSuccess("");

    try {
      const response = await fetch("http://localhost:3000/api/change_email", {
        method: "PATCH",
        credentials: "include",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(emailForm)
      });

      const data = await response.json();

      if (response.ok) {
        setEmailChangeSuccess("Check your email to verify your new address.");
        setEmailForm({ newEmail: "", password: "" });
      } else {
        setEmailChangeError(data || "Failed to update email");
      }
    } catch (error) {
      setEmailChangeError("Connection error. Please try again.");
    }

    setIsEmailChangeLoading(false);
  }

  function clearInterest() {
    setFormData(function (prevFormData) {
      return {
        ...prevFormData,
        interests: []
      };
    });
  }

  function handleNewInterestChange(event: React.ChangeEvent<HTMLInputElement>) {
    setNewInterest(event.target.value);
  }

  function addNewInterest(event: React.FormEvent) {
    event.preventDefault();

    if (!new_interest.trim()) return;

    const formattedInterest = new_interest.trim().startsWith("#")
      ? new_interest.trim()
      : "#" + new_interest.trim();

    if (!availableInterests.includes(formattedInterest)) {
      setAvailableInterests(function (prev) {
        return [...prev, formattedInterest];
      });
      setFormData(function (prev) {
        return {
          ...prev,
          interests: [...prev.interests, formattedInterest]
        };
      });
    }

    setNewInterest("");
  }

  function handleFormChange(field: FormFields, value: string) {
    setFormData(function (prev) {
      return {
        ...prev,
        [field]: value
      };
    });
  }

  function handle_image_change(
    event: React.ChangeEvent<HTMLInputElement>,
    index: number
  ) {
    const file = event.target.files?.[0];
    if (!file) return;

    const image_url = URL.createObjectURL(file);
    setimages_url(function (prev) {
      const updated = [...prev];
      updated[index] = image_url;
      return updated;
    });

    setImages_file(function (prev) {
      const updated = [...prev];
      updated[index] = file;
      return updated;
    });
  }

  function generateImageUploadDivs() {
    return (
      <div className="grid grid-cols-2 gap-4">
        {Array(5)
          .fill(null)
          .map(function (_, i) {
            return (
              <div key={i} className="flex justify-center">
                <label className="w-32 h-32 flex items-center justify-center border-2 border-dashed border-gray-300 rounded-full cursor-pointer hover:border-blue-500">
                  {images_url[i] ? (
                    <img
                      src={images_url[i] || ""}
                      alt={`User image ${i + 1}`}
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
          })}
      </div>
    );
  }

  async function handleSubmit(event: React.FormEvent): Promise<void> {
    event.preventDefault();
    setIsLoading(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch("http://localhost:3000/api/user/settings", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (response.ok) {
        if (
          images_FILES.some(function (file) {
            return file !== null;
          })
        ) {
          const new_data = new FormData();
          images_FILES.forEach(function (file, index) {
            if (file) {
              new_data.append(index, file);
            } else {
              new_data.append(index, "NULL");
            }
          });

          const resu_ = await fetch("http://localhost:3000/api/user/upload", {
            method: "POST",
            credentials: "include",
            body: new_data
          });
          if (!resu_.ok) {
            const resData = await resu_.json();
            setError(resData.message || "Update failed. Please try again.");
          }
        }

        setSuccess("Your information has been updated successfully.");
        // navigate("/home");
      } else {
        setError(data || "Update failed. Please try again.");
      }
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Unable to connect to server. Please try again later."
      );
    }

    setIsLoading(false);
  }

  return (
    <div className="p-12 bg-gray-900 flex items-center justify-center">
      <div className="w-full max-w-md">
        <div className="bg-[#E94075] rounded-2xl p-9">
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold text-white mb-8">
              Edit your profile
            </h2>

            <form onSubmit={handleSubmit} className="space-y-6">
              <TextField
                fullWidth
                label="Last Name"
                inputProps={{
                  minLength: 3,
                  maxLength: 30
                }}
                value={formData.last_name}
                onChange={function (e) {
                  if (e.target.value.length <= 30) {
                    handleFormChange("last_name", e.target.value);
                  }
                }}
                className="bg-white rounded"
              />

              <TextField
                fullWidth
                label="First Name"
                inputProps={{
                  minLength: 3,
                  maxLength: 30
                }}
                value={formData.first_name}
                onChange={function (e) {
                  if (e.target.value.length <= 30) {
                    handleFormChange("first_name", e.target.value);
                  }
                }}
                className="bg-white rounded"
              />

              <FormControl className="w-full">
                <FormLabel id="gender" className="text-white">
                  Gender
                </FormLabel>
                <RadioGroup
                  value={formData.gender}
                  onChange={function (e) {
                    handleFormChange("gender", e.target.value);
                  }}
                >
                  <FormControlLabel
                    value="female"
                    control={<Radio />}
                    label="Female"
                    className="text-white"
                  />
                  <FormControlLabel
                    value="male"
                    control={<Radio />}
                    label="Male"
                    className="text-white"
                  />
                </RadioGroup>
              </FormControl>

              {/* <TextField
                fullWidth
                label="Biography"
                multiline
                rows={4}
                inputProps={{
                  minLength:20,
                  maxLength: 200
                }}
                value={formData.biography}
                onChange={function(e) { handleFormChange("biography", e.target.value); }}
                className="bg-white rounded"
              /> */}

              <TextField
                fullWidth
                type="number"
                label="Age"
                placeholder="Age"
                inputProps={{ min: 18, max: 100 }}
                value={formData.age ?? ""}
                onChange={(e) => {
                  let age = e.target.value ? parseInt(e.target.value, 10) : "";
                  if ((age >= 18 && age <= 100)) {
                    setFormData({ ...formData, age });
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
                // helperText={`${formData.biography?.length || 0}/200 characters`}
                className="bg-white rounded"
              />

              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-white">
                  Your Interests
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  {availableInterests.map(function (interest) {
                    return (
                      <button
                        type="button"
                        key={interest}
                        onClick={function () {
                          toggleInterest(interest);
                        }}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
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
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Add New Interest"
                    value={new_interest}
                    onChange={handleNewInterestChange}
                    className="flex-1 px-4 py-2 rounded-full text-sm bg-gray-800 text-white"
                  />
                  <Button
                    onClick={addNewInterest}
                    variant="contained"
                    className="bg-pink-600"
                  >
                    Add
                  </Button>
                </div>

                <button
                  type="button"
                  onClick={clearInterest}
                  className="w-full bg-pink-600 hover:bg-pink-700 text-white rounded-xl py-3 font-semibold"
                >
                  Clear Interests
                </button>
              </div>

              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-white">
                  Your Photos
                </h3>
                {generateImageUploadDivs()}
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
                {isLoading ? "Updating..." : "Save Changes"}
              </button>
            </form>
          </div>

          {/* Email Change Section */}
          <div className="bg-[#E94075] rounded-2xl p-9">
            <h2 className="text-2xl font-semibold text-white mb-8">
              Change Email
            </h2>
            <TextField
              fullWidth
              label="Old Email"
              type="email"
              inputProps={{
                minLength: 7,
                maxLength: 30,
                readOnly: true
              }}
              value={formData.email}
              // onChange={function (e) {
              //   if (e.target.value.length <= 30) {
              //     handleFormChange("email", e.target.value);
              //   }
              // }}
              className="bg-white rounded"
            />

            <form onSubmit={handleEmailChange} className="space-y-4">
              <TextField
                fullWidth
                label="New Email"
                type="email"
                value={emailForm.newEmail}
                onChange={(e) =>
                  setEmailForm((prev) => ({
                    ...prev,
                    newEmail: e.target.value
                  }))
                }
                className="bg-white rounded"
                required
              />
              <TextField
                fullWidth
                label="Password"
                type="spassword"
                value={emailForm.password}
                onChange={(e) =>
                  setEmailForm((prev) => ({
                    ...prev,
                    password: e.target.value
                  }))
                }
                className="bg-white rounded"
                required
              />
              {emailChangeError && (
                <div className="text-red-500 text-sm bg-red-100 p-2 rounded">
                  {emailChangeError}
                </div>
              )}
              {emailChangeSuccess && (
                <div className="text-green-500 text-sm bg-green-100 p-2 rounded">
                  {emailChangeSuccess}
                </div>
              )}
              <button
                type="submit"
                className="w-full bg-pink-600 hover:bg-pink-700 text-white rounded-xl py-3 font-semibold"
                disabled={isEmailChangeLoading}
              >
                {isEmailChangeLoading ? "Updating Email..." : "Change Email"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Profile;
