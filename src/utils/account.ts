export const getAccountTypeLabel = (type: string) => {
  switch (type) {
    case "checking":
      return "Conto Corrente";
    case "savings":
      return "Conto Risparmio";
    case "investment":
      return "Investimenti";
    default:
      return type;
  }
};