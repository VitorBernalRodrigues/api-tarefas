function paraApi(documento) {
  if (!documento) return null;
  const { _id, ...campos } = documento;
  return { id: _id.toHexString(), ...campos };
}

export { paraApi };
