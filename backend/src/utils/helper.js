import fs from "fs";

// Generate the options for mongodb pagination.
export const getMongoosePaginationOptions = ({
    page = 1,
    limit = 10,
    customLabels,
}) => {
    return {
        page: Math.max(page, 1),
        limit: Math.max(limit, 1),
        pagination: true,
        customLabels: {
            pagingCounter: "serialNumberStartFrom",
            ...customLabels,
        },
    };
};

// Return file static path for serving the image.
export const getStaticFilePath = (req, fileName) => {
    return `${req.protocol}://${req.get("host")}/images/${fileName}`;
};

// Return file local path for file deletion.
export const getLocalPath = (fileName) => {
    return `public/images/${fileName}`;
};

// Remove the file from file system by using local path.
export const removeLocalFile = (localPath) => {
    fs.unlink(localPath, (err) => {
        if (err) console.log("Error while removing local files: ", err);
        else {
            console.log("Removed local: ", localPath);
        }
    });
};