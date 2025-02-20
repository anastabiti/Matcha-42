import { useState, useEffect } from "react";
import Button from "@mui/material/Button";
import Radio from "@mui/material/Radio";
import RadioGroup from "@mui/material/RadioGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import FormControl from "@mui/material/FormControl";
import FormLabel from "@mui/material/FormLabel";
import { TextField } from "@mui/material";
import AddPhotoAlternateIcon from "@mui/icons-material/AddPhotoAlternate";
import { useNavigate } from "react-router-dom";
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
  DirectionsRun,
} from "@mui/icons-material";
import Gps from "./Gps";

type FormData = {
  gender: string;
  biography: string;
  interests: string[];
  age: number;
  pics: string[];
};

type FormFields = "gender" | "biography" | "interests";

type ImageError = {
  index: number;
  message: string;
};

export const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
export const SUPPORTED_FORMATS = ["image/jpeg", "image/jpg", "image/png"];
const MAX_IMAGES = 5;

function Setup_page() {
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
    "#Running",
  ];

  const [availableInterests, setAvailableInterests] =
    useState(defaultInterests);
  const [new_interest, setNewInterest] = useState("");
  const [formData, setFormData] = useState<FormData>({
    gender: "",
    biography: "",
    interests: [],
    age: 18,
    pics: [],
  });

  const navigate = useNavigate();
  const [images_url, setimages_url] = useState<(string | null)[]>(
    Array(MAX_IMAGES).fill(null)
  );
  const [images_FILES, setImages_file] = useState<(File | null)[]>(
    Array(MAX_IMAGES).fill(null)
  );
  const [imageErrors, setImageErrors] = useState<ImageError[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Cleanup function for image URLs
  useEffect(() => {
    return () => {
      images_url.forEach((url) => {
        if (url) URL.revokeObjectURL(url);
      });
    };
  }, [images_url]);

  const validateImage = (file: File): string | null => {
    if (!SUPPORTED_FORMATS.includes(file.type)) {
      return "Only JPG and PNG images are supported";
    }
    if (file.size > MAX_FILE_SIZE) {
      return "File size must be less than 5MB";
    }
    return null;
  };

  const handle_image_change = async (
    event: React.ChangeEvent<HTMLInputElement>,
    index: number
  ) => {
    const files = event.target.files;
    if (!files || !files[0]) return;

    const file = files[0];
    const validationError = validateImage(file);

    if (validationError) {
      setImageErrors((prev) => [
        ...prev.filter((e) => e.index !== index),
        { index, message: validationError },
      ]);
      return;
    }

    // Clear any existing errors for this index
    setImageErrors((prev) => prev.filter((e) => e.index !== index));

    // Create URL and update state
    const image_url = URL.createObjectURL(file);
    setimages_url((prev) => {
      const updated = [...prev];
      if (updated[index]) URL.revokeObjectURL(updated[index]!);
      updated[index] = image_url;
      return updated;
    });

    setImages_file((prev) => {
      const updated = [...prev];
      updated[index] = file;
      return updated;
    });
  };

  function toggleInterest(interest: string) {
    setFormData((prev) => {
      const interestExists = prev.interests.includes(interest);
      const updatedInterests = interestExists
        ? prev.interests.filter((item) => item !== interest)
        : [...prev.interests, interest];

      return {
        ...prev,
        interests: updatedInterests,
      };
    });
  }

  function clearInterest(): void {
    setFormData((prev) => ({ ...prev, interests: [] }));
  }

  function handleNewInterestChange(
    event: React.ChangeEvent<HTMLInputElement>
  ): void {
    setNewInterest(event.target.value);
  }

  function addNewInterest(event: React.FormEvent): void {
    event.preventDefault();
    const trimmedInterest = new_interest.trim();

    if (!trimmedInterest) return;

    const formattedInterest = trimmedInterest.startsWith("#")
      ? trimmedInterest
      : "#" + trimmedInterest;

    if (!availableInterests.includes(formattedInterest)) {
      setAvailableInterests((prev) => [...prev, formattedInterest]);
      setFormData((prev) => ({
        ...prev,
        interests: [...prev.interests, formattedInterest],
      }));
    }

    setNewInterest("");
  }

  function handleFormChange(field: FormFields, value: string) {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }

  function generateImageUploadDivs() {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-3 sm:grid-cols-2 gap-4">
        {Array.from({ length: MAX_IMAGES }, (_, i) => (
          <div key={i} className="flex justify-center">
            <label className="w-32 h-32 flex items-center justify-center border-2 border-dashed border-gray-300 rounded-full cursor-pointer hover:border-blue-500">
              {i === 0 && <div className="absolute text-white">Profile</div>}
              {images_url[i] ? (
                <img
                  src={images_url[i]!}
                  className="w-full h-full rounded-full object-cover"
                  alt={`Upload ${i + 1}`}
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
                accept="image/jpeg,image/png"
                onChange={(e) => handle_image_change(e, i)}
                className="hidden"
              />
            </label>
            {imageErrors.find((error) => error.index === i) && (
              <div className="absolute mt-32 text-red-500 text-xs">
                {imageErrors.find((error) => error.index === i)?.message}
              </div>
            )}
          </div>
        ))}
      </div>
    );
  }

  async function handleSubmit(event: React.FormEvent): Promise<void> {
    event.preventDefault();
    setIsLoading(true);
    setError("");
    setSuccess("");

    if (!images_FILES[0]) {
      setError("Please add a profile picture!");
      setIsLoading(false);
      return;
    }
    if (!formData.gender) {
      setError("Please add  you gender!");
      setIsLoading(false);
      return;
    }

    console.log(formData.interests.length, " formData.interests\n\n\n");
    if (!formData.interests.length) {
      setError("Please add  your interests!");
      setIsLoading(false);
      return;
    }
    try {
      // Upload user information
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_IP}/api/user/setup_information`,
        {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to update user information");
      }

      // Upload images
      if (images_FILES.some((file) => file !== null)) {
        const new_data = new FormData();
        images_FILES.forEach((file, index) => {
          if (file) {
            new_data.append(index.toString(), file);
          }
        });

        const uploadResponse = await fetch(
          `${import.meta.env.VITE_BACKEND_IP}/api/user/upload`,
          {
            method: "POST",
            credentials: "include",
            body: new_data,
          }
        );

        if (!uploadResponse.ok) {
          const uploadError = await uploadResponse.json();
          throw new Error(uploadError.message || "Failed to upload images");
        }
      }

      setSuccess("Your information has been submitted successfully.");

      navigate("/discover");
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "An unexpected error occurred";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className=" min-h-full bg-[#1a1625] ">
      <div className="flex items-center justify-center ">
        <div className="w-full max-w-[95%] sm:max-w-screen-sm mt-9">
          <div className="bg-[#A3195B] rounded-2xl p-4 sm:p-6">
            <div className="space-y-4 sm:space-y-6">
              <h2 className="text-xl sm:text-2xl font-semibold text-white mb-4 sm:mb-8">
                Setup Your Account
              </h2>

              <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
                <div id="gender">Gender</div>
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

                <TextField
                  fullWidth
                  type="number"
                  label="Age"
                  inputProps={{ min: 18, max: 100 }}
                  value={formData.age}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value === "") {
                      setFormData((prev) => ({ ...prev, age: 18 }));
                      return;
                    }
                    const parsedAge = parseInt(value, 10);
                    if (
                      !isNaN(parsedAge) &&
                      parsedAge >= 18 &&
                      parsedAge <= 100
                    ) {
                      setFormData((prev) => ({ ...prev, age: parsedAge }));
                    }
                  }}
                  required
                  className="bg-white rounded"
                />

                <TextField
                  required
                  fullWidth
                  label="Biography"
                  multiline
                  rows={4}
                  inputProps={{
                    minLength: 20,
                    maxLength: 200,
                  }}
                  value={formData.biography}
                  onChange={(e) => {
                    if (e.target.value.length <= 200) {
                      handleFormChange("biography", e.target.value || "");
                    }
                  }}
                  className="bg-white rounded"
                />

                <div className="space-y-4">
                  <h2 className="text-xl sm:text-2xl font-semibold text-white mb-4">
                    Your Interests
                  </h2>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                    {availableInterests.map((interest) => (
                      <button
                        type="button"
                        key={interest}
                        onClick={() => toggleInterest(interest)}
                        className={`px-3 sm:px-4 py-2 rounded-full text-sm font-medium transition-colors flex items-center justify-center
                      ${
                        formData.interests.includes(interest)
                          ? "bg-pink-600 text-white"
                          : "bg-gray-800 text-gray-300 hover:bg-gray-700"
                      }`}
                      >
                        {interest === "#Photography" && (
                          <PhotoCamera className="w-4 h-4 mr-2" />
                        )}
                        {interest === "#Shopping" && (
                          <ShoppingCart className="w-4 h-4 mr-2" />
                        )}
                        {interest === "#Karaoke" && (
                          <Mic className="w-4 h-4 mr-2" />
                        )}
                        {interest === "#Yoga" && (
                          <SelfImprovement className="w-4 h-4 mr-2" />
                        )}
                        {interest === "#Cooking" && (
                          <Restaurant className="w-4 h-4 mr-2" />
                        )}
                        {interest === "#Tennis" && (
                          <SportsTennis className="w-4 h-4 mr-2" />
                        )}
                        {interest === "#Art" && (
                          <Palette className="w-4 h-4 mr-2" />
                        )}
                        {interest === "#Traveling" && (
                          <Flight className="w-4 h-4 mr-2" />
                        )}
                        {interest === "#Music" && (
                          <MusicNote className="w-4 h-4 mr-2" />
                        )}
                        {interest === "#Video games" && (
                          <SportsEsports className="w-4 h-4 mr-2" />
                        )}
                        {interest === "#Swimming" && (
                          <Pool className="w-4 h-4 mr-2" />
                        )}
                        {interest === "#Running" && (
                          <DirectionsRun className="w-4 h-4 mr-2" />
                        )}
                        {/* Use the truncate utility to prevent text from wrapping and truncate overflowing text with an ellipsis (…) if needed: 
                    https://tailwindcss.com/docs/text-overflow#truncating-text
                    
                    <span> tag is used for smaller, inline styling within these blocks or within text content without disrupting the overall flow of the webpage.
                    */}

                        <span className="truncate">{interest}</span>
                      </button>
                    ))}

                    <div className="col-span-1 sm:col-span-2 flex">
                      <input
                        type="text"
                        placeholder="New Interest"
                        minLength={2}
                        maxLength={20}
                        className="flex-1 px-4 py-2 rounded-full text-sm font-medium bg-gray-800 text-gray-300"
                        value={new_interest || ""}
                        onChange={handleNewInterestChange}
                      />
                      <Button
                        type="button"
                        onClick={addNewInterest}
                        variant="contained"
                        className="w-full sm:w-auto"
                      >
                        Add
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-4">
                    {generateImageUploadDivs()}

                    <button
                      type="button"
                      onClick={clearInterest}
                      className="w-full bg-pink-600 hover:bg-pink-700 text-white rounded-xl py-2 sm:py-3 font-semibold text-sm sm:text-base"
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
                    // onClick={handleSubmit}
                    className="w-full bg-pink-600 hover:bg-pink-700 text-white rounded-xl py-2 sm:py-3 font-semibold text-sm sm:text-base"
                  >
                    {isLoading ? "Submitting..." : "Submit your information"}
                  </button>
                </div>
              </form>
              <Gps />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Setup_page;
