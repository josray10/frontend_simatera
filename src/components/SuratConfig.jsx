// Configuration file for letter templates

export const PEMBINA_INFO = {
    nama: "Dr. Ahmad Syauqi, M.T.",
    nip: "NIP. 198507302010121002",
  };
  
  // If you have a logo to include, you could import it like this:
  // export const LOGO_SRC = 'path/to/your/logo.png';
  
  // Function to format date in Indonesian
  export const formatTanggalIndonesia = (date) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(date).toLocaleDateString('id-ID', options);
  };
  
  // Other configurations can be added as needed