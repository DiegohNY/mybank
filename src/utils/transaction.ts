export const getTransactionTitle = (type: string, description?: string) => {
  if (
    description &&
    (description.includes("Trasferimento da ") ||
      description.includes("Trasferimento a "))
  ) {
    if (type === "transfer_in") {
      return "Bonifico ricevuto";
    } else if (type === "transfer_out") {
      return "Bonifico inviato";
    }
  }

  switch (type) {
    case "deposit":
      return "Deposito";
    case "withdrawal":
      return "Pagamento";
    default:
      return "Operazione";
  }
};

export const formatTransactionDescription = (description: string) => {
  // Se è una descrizione generica o vuota, ritorna null per non mostrarla
  if (
    !description ||
    description.trim() === "" ||
    description === "Operazione bancaria" ||
    description.includes("Trasferimento da ") ||
    description.includes("Trasferimento a ")
  ) {
    return null;
  }

  return description;
};

export const isPositiveTransaction = (type: string) => {
  return type === "deposit" || type === "transfer_in";
};
