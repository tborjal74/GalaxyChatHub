import { useEffect, useState } from "react";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { API_URL } from "../../config";

type FriendProfileProps = {
  userId: string | number;
  onClose: () => void;
};

export function FriendProfileSidebar({ userId, onClose }: FriendProfileProps) {
  const [user, setUser] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`${API_URL}/api/users/${userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (data.success) setUser(data.data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };

    if (userId) load();
  }, [userId]);

  function avatarUrl(path: string | undefined) {
    if (!path) return undefined;
    if (path.startsWith("http")) return path;
    return `${API_URL}${path}`;
  }

  return (
    <aside className="w-80 min-w-80 shrink-0 border-l border-border bg-card/40 p-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white">Profile</h3>
        <button
          onClick={onClose}
          className="text-sm text-gray-400 hover:text-white cursor-pointer"
        >
          Close
        </button>
      </div>

      <div className="mt-4">
        {loading && <div className="text-sm text-gray-400">Loading...</div>}
        {!loading && !user && (
          <div className="text-sm text-gray-400">Not found</div>
        )}

        {user && (
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <Avatar className="w-16 h-16">
                {user.avatarUrl ? (
                  // @ts-ignore
                  <img
                    src={avatarUrl(user.avatarUrl)}
                    alt="avatar"
                    className="w-full h-full object-cover rounded-full"
                  />
                ) : (
                  <AvatarFallback className="bg-gradient-to-br from-purple-500 to-violet-600 text-white text-2xl">
                    {user.username?.charAt(0)?.toUpperCase()}
                  </AvatarFallback>
                )}
              </Avatar>

              <div>
                <div className="font-medium text-white">{user.username}</div>
                <div className="flex items-center gap-1 text-sm">
                  {(() => {
    const status = String(user.status || "offline").trim().toLowerCase();
    const isOnline = status === "online";

    return (
      <>
        <span
          className={`h-2 w-2 rounded-full ${
            isOnline ? "bg-green-500" : "bg-red-500"
          }`}
        />

        <span className={isOnline ? "text-green-400" : "text-red-400"}>
          {isOnline ? "Online" : "Offline"}
        </span>
      </>
    );
  })()}
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-sm font-medium text-gray-300">Bio</h4>
              <p className="text-sm text-gray-200">
                {user.bio || "No bio available."}
              </p>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
