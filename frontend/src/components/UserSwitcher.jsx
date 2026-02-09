export default function UserSwitcher({ user, setUser }) {
    return (
      <div>
        <label>User: </label>
        <select
          value={user.role}
          onChange={(e) =>
            setUser({
              ...user,
              role: e.target.value,
              id: e.target.value === "OWNER" ? 1 : 2,
            })
          }
        >
          <option value="OWNER">Owner</option>
          <option value="VENDOR">Vendor</option>
        </select>
      </div>
    );
  }
  