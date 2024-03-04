export const getFileNameFromUrl = (url: string) => {
    const path = url.split('/');
    const fileNameWithQueryParams = path[path.length - 1];
    const fileNameParts = fileNameWithQueryParams.split('?');
    const fileName = fileNameParts[0];
    return fileName;
  };