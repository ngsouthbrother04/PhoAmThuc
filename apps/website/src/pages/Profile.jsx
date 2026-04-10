import { useEffect, useMemo, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { authAPI, usersAPI } from "../lib/api";
import { useTranslation } from "../hooks/useLanguageContext";
import { useToast } from "../hooks/useToast";

function formatDate(dateValue, locale) {
  if (!dateValue) return "-";
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return "-";
  return new Intl.DateTimeFormat(locale, {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export default function Profile() {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [profile, setProfile] = useState(null);
  const [fullNameInput, setFullNameInput] = useState("");
  const [isUpdatingName, setIsUpdatingName] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const t = useTranslation();
  const { showSuccess, showError, showInfo } = useToast();
  const token = localStorage.getItem("accessToken");

  const locale = useMemo(() => {
    const preferred = localStorage.getItem("preferredLanguage") || "vi";
    switch (preferred) {
      case "en":
        return "en-US";
      case "ja":
        return "ja-JP";
      case "ko":
        return "ko-KR";
      case "zh":
        return "zh-CN";
      case "th":
        return "th-TH";
      default:
        return "vi-VN";
    }
  }, []);

  useEffect(() => {
    if (!token) return;

    const loadProfile = async () => {
      try {
        setIsLoading(true);
        setError("");
        const response = await usersAPI.getProfile();
        const userData = response?.data || response;
        setProfile(userData);
        if (userData?.role && !localStorage.getItem("uiRole")) {
          localStorage.setItem("uiRole", String(userData.role).toUpperCase());
        }
        setFullNameInput(userData?.fullName || "");
      } catch (err) {
        setError(err?.message || "Không tải được hồ sơ.");
      } finally {
        setIsLoading(false);
      }
    };

    loadProfile();
  }, [token]);

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  const handleUpdateName = async (e) => {
    e.preventDefault();

    const nextName = fullNameInput.trim();
    if (!nextName) {
      showError("Tên không được để trống.");
      return;
    }

    if (nextName === (profile?.fullName || "")) {
      showInfo("Tên không thay đổi.");
      return;
    }

    try {
      setIsUpdatingName(true);
      const res = await usersAPI.updateProfile(nextName);
      const updated = res?.data || {};
      setProfile((prev) => ({
        ...prev,
        ...updated,
        fullName: updated.fullName || nextName,
      }));
      showSuccess("Cập nhật tên thành công.");
    } catch (err) {
      showError(err?.message || "Không thể cập nhật tên.");
    } finally {
      setIsUpdatingName(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();

    if (!currentPassword || !newPassword || !confirmPassword) {
      showError("Vui lòng nhập đầy đủ thông tin mật khẩu.");
      return;
    }

    if (newPassword.length < 6) {
      showError("Mật khẩu mới phải có ít nhất 6 ký tự.");
      return;
    }

    if (newPassword !== confirmPassword) {
      showError("Xác nhận mật khẩu mới không khớp.");
      return;
    }

    try {
      setIsChangingPassword(true);
      const res = await authAPI.changePassword(currentPassword, newPassword);
      const message =
        res?.message || "Đổi mật khẩu thành công. Vui lòng đăng nhập lại.";
      showSuccess(message);

      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");

      setTimeout(() => {
        window.location.href = "/login";
      }, 1000);
    } catch (err) {
      showError(err?.message || "Không thể đổi mật khẩu.");
    } finally {
      setIsChangingPassword(false);
    }
  };

  return (
    <div className="w-full min-h-full bg-slate-50 p-4 md:p-6">
      <div className="h-full w-full rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
        <p className="mb-2 text-sm font-semibold uppercase tracking-[0.25em] text-orange-500">
          {t.nav.profile}
        </p>
        <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <h1 className="text-3xl font-black text-slate-900">
            WELCOME BACK {profile?.fullName || t.nav.profile}
          </h1>
          <Link
            to="/partner-profile"
            className="inline-flex h-11 items-center justify-center rounded-xl border border-emerald-300 bg-emerald-50 px-4 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-100"
          >
            Qua trang đối tác
          </Link>
        </div>

        {isLoading && (
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-slate-600">
            {t.common.loading}
          </div>
        )}

        {!isLoading && error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-red-700">
            {error}
          </div>
        )}

        {!isLoading && !error && profile && (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            <div className="rounded-2xl border border-slate-200 bg-white p-4">
              <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-slate-500">
                ID
              </p>
              <p className="break-all text-sm font-medium text-slate-800">
                {profile.id}
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-4">
              <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-slate-500">
                {t.auth.email}
              </p>
              <p className="text-sm font-medium text-slate-800">
                {profile.email || "-"}
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-4">
              <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-slate-500">
                {t.auth.fullName}
              </p>
              <p className="text-sm font-medium text-slate-800">
                {profile.fullName || "-"}
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-4">
              <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-slate-500">
                Language
              </p>
              <p className="text-sm font-medium text-slate-800">
                {(
                  profile.preferredLanguage ||
                  localStorage.getItem("preferredLanguage") ||
                  "vi"
                ).toUpperCase()}
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-4">
              <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-slate-500">
                Role
              </p>
              <p className="text-sm font-medium text-slate-800">
                {profile.role || "USER"}
              </p>
            </div>

            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 md:col-span-2 xl:col-span-3">
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="text-sm font-semibold text-emerald-800">
                    Khu vực đối tác
                  </p>
                  <p className="mt-1 text-xs text-emerald-700">
                    {String(profile.role || "USER").toUpperCase() === "PARTNER"
                      ? "Tài khoản của bạn đã là PARTNER. Bạn có thể tạo POI từ trang đối tác."
                      : "Bạn có thể gửi yêu cầu đăng ký trở thành đối tác tại trang riêng để ADMIN duyệt."}
                  </p>
                </div>
                <Link
                  to="/partner-profile"
                  className="inline-flex h-10 items-center justify-center rounded-xl bg-emerald-600 px-4 text-sm font-semibold text-white transition hover:bg-emerald-700"
                >
                  Trở thành đối tác
                </Link>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-4 md:col-span-2 xl:col-span-3">
              <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-slate-500">
                Created At
              </p>
              <p className="text-sm font-medium text-slate-800">
                {formatDate(profile.createdAt, locale)}
              </p>
            </div>

            <form
              onSubmit={handleUpdateName}
              className="rounded-2xl border border-slate-200 bg-white p-4 md:col-span-2 xl:col-span-3"
            >
              <p className="mb-3 text-sm font-semibold text-slate-900">
                Đổi tên hiển thị
              </p>
              <div className="flex flex-col gap-3 md:flex-row">
                <input
                  type="text"
                  value={fullNameInput}
                  onChange={(e) => setFullNameInput(e.target.value)}
                  placeholder="Nhập tên mới"
                  className="h-11 w-full rounded-xl border border-slate-300 px-3 text-sm outline-none transition focus:border-orange-500"
                />
                <button
                  type="submit"
                  disabled={isUpdatingName}
                  className="h-11 rounded-xl bg-slate-900 px-5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:opacity-60"
                >
                  {isUpdatingName ? "Đang lưu..." : "Lưu tên"}
                </button>
              </div>
            </form>

            <form
              onSubmit={handleChangePassword}
              className="rounded-2xl border border-slate-200 bg-white p-4 md:col-span-2 xl:col-span-3"
            >
              <p className="mb-3 text-sm font-semibold text-slate-900">
                Đổi mật khẩu
              </p>
              <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Mật khẩu hiện tại"
                  className="h-11 rounded-xl border border-slate-300 px-3 text-sm outline-none transition focus:border-orange-500"
                />
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Mật khẩu mới"
                  className="h-11 rounded-xl border border-slate-300 px-3 text-sm outline-none transition focus:border-orange-500"
                />
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Nhập lại mật khẩu mới"
                  className="h-11 rounded-xl border border-slate-300 px-3 text-sm outline-none transition focus:border-orange-500"
                />
              </div>
              <div className="mt-3">
                <button
                  type="submit"
                  disabled={isChangingPassword}
                  className="h-11 rounded-xl bg-orange-500 px-5 text-sm font-semibold text-white transition hover:bg-orange-600 disabled:opacity-60"
                >
                  {isChangingPassword ? "Đang đổi..." : "Đổi mật khẩu"}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
